# IIPS v3.0 — NP-13 Evidence Landing / Navigation Canonical Implementation Designation
## Authority Record for the Canonical NP-13 Implementation

**Program:** IIPS Engineering Standards — Program v3.0
**Workstream:** NP-13 — Evidence Landing / Navigation
**Decision identifier:** NP-13-AUTH-02 — Canonical Implementation Designation
**Document type:** AUTHORITY DECISION — Governance designation record only (not implementation, certification, release, or production authority)
**Version:** 1.0 — Decision
**Date:** 2026-10-01
**Signer:** Ramki (Ramakrishnan)
**Title / Role:** Program Authority
**Status:** AUTH-02 — CANONICAL DESIGNATION ACCEPTED
**Ratification:** RATIFIED
**Disposition:** ACCEPTED — CANONICAL DESIGNATION ESTABLISHED; FEATURE-BASELINE COMPOSITION DEFERRED TO PROGRAM CONTROL DISPOSITION
**Repository:** `ramkivs/iips-review-recovered`
**Branch:** `arena/01a0f351-iips-review-recovered`
**IRR authority baseline:** `034384fbd1d1c359a95afa1dad294507fdfd3269`
**IPD reference baseline:** `ramkivs/iips-production-market-data` `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` (READ ONLY — 0 mutations)
**Governing authority:** NP-13-AUTH-01 (`7a871fb20a55fb87e786ca1120c4b62051393576`, blob `564b36b1778485a1c190fb7b3bb98068cdf83bd7`)
**Governing evidence:** CONVERGENCE-00B; CONVERGENCE-01; D-1 three-way baseline determination; baseline-authority / ref-realization determination; NP-13-AUTH-02 preparation gate
**Implementation boundary:** This record designates the canonical NP-13 implementation only. It does **NOT** grant implementation authority, production authority, certification authority, or release authority; it authorizes no source change; and it does not determine feature-baseline composition.

---

## 1. Canonical Designation

1.1 `034384fbd1d1c359a95afa1dad294507fdfd3269` is designated the **canonical NP-13 implementation**.

1.2 It conforms to the established implementation-authorization convention of this program: it is the **direct child** of authority record `7a871fb20a55fb87e786ca1120c4b62051393576` (NP-13-AUTH-01), and its commit body cites *"governance commit 7a871fb"*. This is the same convention evidenced by NP-09 (`fbe76496` ← `ceec1bda`), NP-10 (`ba8ea1df` ← `f5a56477`), and NP-11 (`0feceafd` ← `a75b3463`).

1.3 **No in-repository NP-13 Implementation Gate record exists** — and none exists for NP-09, NP-10, or NP-11 either. This absence is **program-wide**, is recorded here, and is **not resolved by inference**.

1.4 Qualification of `034384fb…` is **self-recorded in its own commit body** (577 passed / 2 failed / 25 skipped across 49 test files; typecheck exit 0; build exit 0). No independent NP-13 qualification record exists in the repository. The two failures are the pre-existing baseline failures `server/product-transport.test.ts` and `server/pit/pitRuntimeIntegration.test.ts`.

## 2. Status of the Later Implementation

2.1 `fa9862c9668f0deb9b1093415fdd9c551036240f` is **NOT** the canonical NP-13 implementation.

2.2 It does not conform to the convention stated in 1.2: its parent `795fece08211fec2a3e1de1d7f32317d7748dd6e` is a **governance-document transplant commit**, not an authority record, and its commit message cites no authority. **`fa9862c…`'s parentage does not independently establish that an Implementation Gate was convened, nor that implementation was independently authorized.**

2.3 **Replacement authorization for `fa9862c…` is NOT ESTABLISHED.** A repository-wide search for `034384`, `supersede`, `replace`, `duplicate`, `reimplement`, `discard`, and `abandon` returned zero matches.

2.4 **Intent is NOT CHARACTERISED. INTENT NOT ESTABLISHED.** `fa9862c…` is characterised neither as accidental nor as deliberate.

2.5 `fa9862c…` is **retained intact** as historical and provenance evidence. No deletion, alteration, rollback, or retroactive authorization is performed or authorized by this record.

## 3. Relationship to NP-13-ACCEPT-01

3.1 NP-13-ACCEPT-01 (`a7c421ae00de309687084fd05679c519c347d196`) is **preserved UNCHANGED**. It truthfully records that an acceptance involving `fa9862c…` occurred, and it **is not invalid**.

3.2 NP-13-ACCEPT-01 makes **no claim** of implementation or replacement authorization; it expressly disclaims conferring authorization (*"This acceptance record does not convert any limitation into a commitment or authorization"*). **There is therefore no authorization conflict between NP-13-ACCEPT-01 and this record.**

3.3 Acceptance does not retroactively confer implementation authorization.

3.4 This record does not supersede, amend, correct, or reinterpret any statement of NP-13-ACCEPT-01, and it does not alter NP-09-PROMO-01.

## 4. Preserved NP-13-AUTH-01 Conditions

All conditions of NP-13-AUTH-01 remain in force and are unmodified by this record:

- **IB-1 … IB-7** implementation boundary, including **IB-7 protected components**: `EvidenceExplorer`, `ReplayExplorer`, `EvidenceExplorerComponents`, `api/evidence.ts`, `api/replay.ts`, the evidence/replay DTOs, `executive-transport.ts`, `ReplayService`, `EvidencePipeline`, the frozen Replay Baseline and golden outputs, SNAPSHOT/CERTIFIED labelling, and **all NP-09 / NP-10 / NP-11 code**;
- **IB-2** data-source boundary — only existing exported typed clients; the read must yield all 13 subjects; the `opportunity` arrays (10 of 13) must not be used to enumerate;
- **IB-4** reserved paths — `/evidence/snapshots` and bare `/evidence/replay` must not resolve as evidence subjects;
- **F-04** governed subject set — the frozen v1.1 Replay Baseline's 13 sectors;
- **G3 / M-5 remain OPEN**, disclosed and expressly not a blocker; this record does not remediate, close, or claim them.

**AUTH-01's recording restriction is also preserved:** *"No commit of this record or of any implementation should be made on the unreconciled local `HEAD`."* Accordingly this record is placed on `arena/01a0f351-iips-review-recovered`, the branch carrying the authorized implementation.

## 5. Deferred Product-Contract Questions

5.1 **Freshness contract** — SEPARATE DECISION REQUIRED. The canonical implementation retains its existing `034384fb…` semantics (`FRESHNESS_STATE` over LIVE / SNAPSHOT / STALE / UNAVAILABLE / REPLAY). The SNAPSHOT-only behaviour of `fa9862c…` is **not** transplanted.

5.2 **13-subject runtime invariant** — SEPARATE DECISION REQUIRED. The runtime enforcement of exactly 13 subjects present in `fa9862c…` is **not** transplanted. NP-13-AUTH-01 F-04 defines the governed *set*; it does not mandate runtime enforcement.

## 6. Unaffected Foundations

6.1 **NP-09 / NP-10 / NP-11 qualification is UNAFFECTED.** The 283-vs-518 test-count difference is a **lineage difference**, not a regression: 46 test files − 12 absent + 1 added = 35. All runs share the same two pre-existing failures and 25 skipped tests.

6.2 **NP-14, RR ↔ IPD integration, PIT / IU-7, IU-8, D114, and G3 / OIDC are not reopened** by this record. NP-14 status is not re-evaluated.

6.3 **IPD boundary UNAFFECTED.** The IRR compatibility pin `0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` is **identical at both NP-13 implementations**, so the canonical designation has no IPD consequence. IPD remains read-only with 0 mutations.

## 7. Feature-Baseline Boundary — Expressly Out of Scope

**Feature-baseline composition is deferred to Program control disposition.**

This record does **not**:

- define the "active non-production IRR feature baseline";
- define any logical baseline;
- bind any feature baseline to a repository ref;
- establish feature-baseline realization semantics;
- compose NP-09 together with NP-13;
- supersede, replace, or promote any baseline;
- select `034384fb…`, `a7c421ae…`, current `main`, or any other ref as the feature baseline;
- establish NP-13-RECON-01.

These questions remain subject to the existing Program Authority **control-disposition mechanism**.

**`NP-12 STATUS = NOT DETERMINED`** — NP-12 is neither promoted nor excluded by this record, and its implementation is not evaluated here.

## 8. Historical Chronology (Preserved, Not Rewritten)

| Time (UTC) | Commit | Event |
| :--- | :--- | :--- |
| 2026-10-01 05:44:05 | `7a871fb2` | NP-13-AUTH-01 recorded |
| 2026-10-01 07:18:59 | `034384fb` | **Canonical implementation** (direct child of AUTH-01) |
| 2026-10-01 07:26:11 | `795fece0` | AUTH-01 document transplanted verbatim onto the `main` lineage |
| 2026-10-01 07:36:15 | `fa9862c9` | Later implementation (+17m16s after the canonical one) |
| 2026-10-01 07:49:19 | `a7c421ae` | NP-13-ACCEPT-01 recorded, naming `fa9862c…` |

No historical record is rewritten, deleted, or reinterpreted.

## 9. Disposition

> **ACCEPTED — CANONICAL DESIGNATION ESTABLISHED; FEATURE-BASELINE COMPOSITION DEFERRED TO PROGRAM CONTROL DISPOSITION**

**Signer:** Ramki (Ramakrishnan) — Program Authority
**Date:** 2026-10-01
**Ratification:** RATIFIED

### Established by this record

- the NP-13-AUTH-01 authority chain;
- the NP-13 canonical designation basis;
- the qualified implementation identity (`034384fb…`);
- conformance to the existing authority-record convention.

### NOT established by this record

- a separate in-repository NP-13 Implementation Gate;
- a feature-baseline definition;
- feature-baseline ref binding;
- feature-baseline realization semantics;
- NP-12 inclusion or exclusion.

## 10. Affirmed Non-Actions

This record performs **no**:

- merge, cherry-pick, rebase, reset, revert, amend, or branch/commit deletion;
- promotion of `fa9862c…`;
- source, test, route, component, transport, service, or configuration change;
- modification of NP-13-AUTH-01, NP-13-ACCEPT-01, or NP-09-PROMO-01;
- modification of `main` or of any NP-12 artifact;
- protected-foundation change;
- IPD mutation (0 changes; IPD `main@4d3e1cdca3a33da0ec3be8b336b17128108a502c` unchanged);
- feature-baseline determination, ref binding, or reconciliation record.

Only this governance document is added.