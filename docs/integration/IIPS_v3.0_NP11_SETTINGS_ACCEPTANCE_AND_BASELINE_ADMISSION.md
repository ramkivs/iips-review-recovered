# IIPS v3.0 — NP-11 Settings / Configuration — ACCEPTANCE AND BASELINE ADMISSION

**Record ID:** NP-11-ACCEPT-01
**Date:** 2026-10-04
**Repository:** `ramkivs/iips-review-recovered` (**IRR**)
**Ref:** `arena/01a0f351-iips-review-recovered`
**Status:** **ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

> ### **NP-11 SETTINGS / CONFIGURATION — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

---

## 1. Acceptance decision

The **NP-11 Settings / Configuration** capability, as qualified by `NP-11-QUAL-01`, is hereby
**ACCEPTED INTO THE ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**.

Acceptance is granted on the basis of a completed qualification, a verified governance
ancestry, an executed regression profile showing no new failures, and explicit authorization
by the holder of feature-baseline membership jurisdiction.

---

## 2. Accepting authority

| Field | Value |
| --- | --- |
| **Accepting Authority** | **Program Authority — Ramki (Ramakrishnan)** |
| **Authority basis** | `NP-13-D0-01.md` (IRR `main`, `docs/integration/`) — **Signer: Ramki (Ramakrishnan), Program Authority; Status: D0 — ESTABLISHED / JURISDICTION DESIGNATED; Ratification: RATIFIED; 2026-10-02.** §1.3 vests **"Feature-baseline DEFINITION + COMPOSITION + MEMBERSHIP"** in the designated holder; §8 establishes the holder (§2.1), the subject matters J-1/J-2/**J-3 membership**, and that **each exercise be its own explicit act** (§2.3) |
| **Nature of this act** | An exercise of **J-3 — baseline MEMBERSHIP**, made as its own explicit act |
| **Authorization** | Explicit acceptance authorization granted by Program Authority during `GATE-NP11-ACCEPTANCE-R1`, 2026-10-04 |
| **Decision date** | 2026-10-04 |

### 2.1 Corroborating authority records

`NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` (IRR `main`, root path) states verbatim at `D-N4-CERT-07`:
> **"Program Authority (Ramki / Ramakrishnan) is the sole Acceptance Authority."**

Also naming Ramki as Program Authority / Signer: `NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md`,
`NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md`, `NP-12-A8-S-03-FAILED-BRANCH-AUTHORITY-DECISION-RECORD.md`.

**Scope note recorded transparently:** those NP-12 records are rendered within the `NP-12 N4`
certification-envelope context (`D-N4-CERT-06` limits the parallel certification authority to
`N4-SD`, `N4-A10`, `N4-A13` and the combined `NP-12 N4` envelope). They are cited as
**corroboration of the Program Authority role**, not as the operative basis. The operative basis
is `NP-13-D0-01` §1.3 / §2.3, which governs feature-baseline membership directly.

### 2.2 Execution and provenance

| Role | Actor |
| --- | --- |
| **Acceptance decision (authority)** | Ramki (Ramakrishnan) — Program Authority |
| **Authorization recorded** | `GATE-NP11-ACCEPTANCE-R1` §2, and the authorization election of 2026-10-04 |
| **Investigation, verification, drafting, commit, push** | `arena-agent` — acting under that authorization, not as the authority |

The acceptance decision is **not** attributed to `arena-agent`. The agent holds no feature-baseline
membership jurisdiction and claims none.

---

## 3. Qualification prerequisite

| Field | Value |
| --- | --- |
| **Qualification record** | `NP-11-QUAL-01` — `IIPS_v3.0_NP11_SETTINGS_NON_PRODUCTION_QUALIFICATION.md` |
| **Qualification commit** | `0e13ad4815c0717d2b761a89d8d13e810ed99070` (2026-10-04T06:48:19Z) |
| **Qualification artifact blob** | `ff864782461f1462747c304d077e354f5dc1ccf0` (21,264 bytes) |
| **Qualification result** | **QUALIFIED — NON-PRODUCTION** |

The qualification record was **remotely verified and re-read** from the authoritative ref prior to
this act. It states, verbatim:

> **"CERTIFICATION IS NOT GRANTED by this record."**
> **"ACCEPTANCE IS NOT GRANTED by this record."** Acceptance requires a separate explicit acceptance act.
> **"PROMOTION IS NOT GRANTED by this record."**
> **"PRODUCTION READINESS IS NOT GRANTED by this record."**

Acceptance is therefore a **new and separate act**, taken here, and is not a restatement or
extension of the qualification.

---

## 4. Accepted coordinates (exact)

| Coordinate | Value |
| --- | --- |
| **Governance** (NP-11-AUTH-01) | **`a75b346375e13e3c01a3d41a8bd8ef74567580f3`** — 2026-09-30T20:16:39Z — author `ramkivs` — `docs/integration/IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| **Implementation** | **`0feceafdd9d948fc9b3c78edb075ccf52b254254`** — 2026-09-30T20:27:28Z — author `ramkivs` — *"feat(settings): implement NP-11 UI12 Settings under NP-11-AUTH-01"* |
| **Governance → implementation ancestry** | `a75b3463…` is the **direct parent** of `0feceafd…` |
| **Qualification** | `0e13ad4815c0717d2b761a89d8d13e810ed99070` |
| **Acceptance (this record)** | `NP-11-ACCEPT-01` |
| **Repository / ref** | `ramkivs/iips-review-recovered` (IRR) @ `arena/01a0f351-iips-review-recovered` |
| **Reachability** | `0feceafd…` is an ancestor of the branch tip — `compare` → **ahead 9 / behind 0** |
| **Later NP-11 implementation commits** | **None.** No commit after `0feceafd…` touches a settings path |
| **NP-11 paths on `main`** | **0** — implementation remains branch-only |

### 4.1 Implementation surface (from `0feceafdd9d948fc9b3c78edb075ccf52b254254`)

```
frontend/server/settings/settings-route-integration.test.ts
frontend/server/settings/settings-service.test.ts
frontend/server/settings/settings-service.ts
frontend/server/settings/settings-transport.test.ts
frontend/server/settings/settings-transport.ts
frontend/src/api/settings.ts
frontend/src/features/settings/Settings.test.tsx
frontend/src/features/settings/Settings.tsx
frontend/src/features/settings/themeSync.ts
```
*9 settings paths — plus 5 shared integration paths:* `frontend/server/executive-transport.ts`,
`frontend/src/app/App.tsx`, `frontend/src/app/navigation.ts`, `frontend/src/app/routes.ts`,
`frontend/src/main.tsx` *(14 files total).*

**No source or test file was created, modified, or deleted by this acceptance act.**

---

## 5. Accepted scope

Acceptance covers **exactly the scope qualified by `NP-11-QUAL-01`**, and nothing beyond it.

| Scope element | Accepted state |
| --- | --- |
| **Product boundary** | NP-11 Settings / Configuration — personal configuration surface |
| **Preference set** | **CLOSED** — theme: `light` \| `dark` only |
| **Private / user-owned semantics** | Private, user-owned, tenant-scoped personal configuration; system-defined governed defaults; **no sharing**; **no browser storage** |
| **Ownership key** | `(tenantId, userId)` — **server-derived**, never client-supplied |
| **Tenant-scoped behavior** | *"isolates owners within the same tenant"*; *"isolates tenants across the same user id"*; *"never discloses another owner's settings (same tenant)"*; *"rejects client-supplied identity"* |
| **Persistence** | Gate-P Class C, **distinct settings consumer boundary**, `IRR Server Tier`; `persistence-service.ts` unmodified |
| **Restart durability** | In-process journal reconstruction; owner-scoped — *"survives restart and applies only to the owning user"* |
| **Schema / version handling** | Settings schema version **distinct from** journal format version; 7 dedicated cases |
| **Corruption / fail-closed** | Unsupported schema version → **422**; unrecognized journal record → **500**; malformed non-final journal line → fail closed; unsupported whole-journal format version → fail closed |
| **Operational limitation** | **NON-PRODUCTION** |

---

## 6. Persistence boundary

| Field | Value |
| --- | --- |
| **Class** | Gate-P **Class C** append-only event journal |
| **Consumer boundary** | **Distinct settings consumer boundary** — resolves its journal to a boundary separate from other consumers; writes **only** there |
| **Ownership** | **IRR Server Tier** (designated by NP-11-AUTH-01) |
| **Foundation integrity** | `frontend/server/persistence/persistence-service.ts` — **NOT modified** (0 occurrences in the change set); the NP-04 foundation is consumed as-is |
| **Restart durability** | In-process journal reconstruction only |
| **Not included** | Out-of-process OS / container restart durability; external datastore persistence; cross-service durability |

---

## 7. Security boundary

| Element | State |
| --- | --- |
| **Identity derivation** | `tenantId` and `userId` derived **server-side from the authenticated principal**; client-supplied identity rejected |
| **Authentication mechanism** | Consumes the **existing** authenticated-principal boundary — **no new mechanism introduced** |
| **Tenant isolation** | Verified — owner isolation within a tenant; tenant isolation across the same user id; no disclosure of another owner's settings |
| **Privacy / defaults** | System-defined governed defaults; no sharing; no tenant/admin-defined personal settings; no browser storage |
| **Authorization scope** | UI12 Settings / Configuration only |

---

## 8. G3 limitation — PRESERVED OPEN

> **The browser→transport credential path / G3 dependency remains OPEN.**

| Field | Value |
| --- | --- |
| **Status** | **OPEN** — explicit acceptance limitation |
| **Governing text** | NP-11-AUTH-01 §7: *"G3 / M-5 remain **OPEN**. This record does not remediate, close, or claim them."* |
| **Operational basis** | NP-11 proceeds on the same basis as the accepted NP-09 and NP-10 capabilities — server-derived ownership scoping enforced at the governed server boundary, with the browser credential path supplied out-of-band |
| **Constraint** | NP-11 must **not** weaken that boundary |
| **Not claimed** | Browser credential-path support is **not** claimed. No live IdP / Keycloak / OIDC capability is admitted |

**This acceptance does not resolve, close, or narrow G3.**

---

## 9. Evidence basis for acceptance

| # | Evidence | Result |
| --- | --- | --- |
| 1 | Governance ancestry | `a75b3463…` → `0feceafd…` (direct parent) verified remotely |
| 2 | NP-11 focused qualification suite | **81 discovered / 81 passed / 0 failed / 0 skipped**, 4/4 files, exit 0 |
| 3 | HTTP security subset | **36 / 36 passed** — 0 failed, exit 0 |
| 4 | UI subset | **17 / 17 passed** — 0 failed, exit 0 |
| 5 | Population composition | **81 = 5 / 28 / 31 / 17** |
| 6 | Full-suite delta | **437 passed / 2 failed / 25 skipped → 518 passed / 2 failed / 25 skipped** |
| 7 | New failures / skips | **0 new failures, 0 new skips** — `+81 passed`, failed and skipped counts identical |
| 8 | Typecheck | **PASS (exit 0)** |
| 9 | Build | **PASS (exit 0)** |
| 10 | Scope dimensions | All twelve (D1–D12) covered by executed cases |
| 11 | Protected foundations | `persistence-service.ts` unmodified; adjacent governed routes undisturbed |
| 12 | IPD isolation | IPD `main` `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — 0 mutations, 0 NP-11 references |
| 13 | Pre-existing failures | **2** — `product-transport` taxonomy; `pitRuntimeIntegration` IU5R-13. **Not NP-11-induced**, unchanged, and **not** closed by this acceptance |
| 14 | Acceptance-state sweep | **0** NP-11 acceptance or promotion acts across all 50 IRR + 32 IPD branches before this record |

### 9.1 Note on the `81/81` phrasing

The durable qualification record states the focused result as a table — **81 discovered / 81
passed / 0 failed / 0 skipped** — rather than the literal string `81/81`. Substantively
identical; no discrepancy. `36/36` and `17/17` appear literally.

---

## 10. Known limitations

1. **G3 / browser→transport credential path remains OPEN** (§8). Explicit acceptance limitation.
2. **Restart durability is in-process / journal-reconstruction scope.** Deployment-tier
   out-of-process restart is not established.
3. **Identity is non-production.** Production Keycloak/OIDC realm activation, certificate
   provisioning, and external IdP cutover are outside this acceptance.
4. **Two pre-existing full-suite failures remain open** (`product-transport` taxonomy;
   `pitRuntimeIntegration` IU5R-13). Neither is NP-11-induced; neither is closed here.
5. **Branch-only durability.** The implementation and this record exist on
   `arena/01a0f351-iips-review-recovered`; **0 NP-11 paths exist on `main`**.
6. **Execution environment.** Results produced on Node `v22.22.3` / npm `10.9.8` / vitest
   `2.1.9` / TypeScript `5.9.3`, Linux `6.1.158+ x86_64`, against a clean clone at the exact
   qualified commit. Reproducible from that coordinate; not re-run on a second machine.
7. **Placement convention unresolved.** Durability conventions **C-1** (`main` authoritative)
   and **C-2** (branch placement) are **unreconciled** (`NP-13-D0-01` GAP-6). This record is
   placed per C-2 precedent; see §12.

---

## 11. Explicit exclusions

The following are **explicitly excluded** from this acceptance:

* Any **IPD** implementation or IPD-side artifact
* **Production** deployment, production identity, or **live Keycloak / OIDC**
* **Out-of-process OS / container restart** qualification
* **Concurrency / load** qualification
* **Browser credential-path** support (G3 — §8)
* **Certification** of any kind
* **Promotion of the implementation to `main`**
* Closure of **G3**, or of the two pre-existing full-suite failures
* Any capability outside the qualified NP-11 Settings / Configuration scope

---

## 12. Placement decision

| Field | Value |
| --- | --- |
| **Repository** | IRR `ramkivs/iips-review-recovered` |
| **Ref** | `arena/01a0f351-iips-review-recovered` |
| **Convention applied** | **C-2** (branch placement) |
| **Precedent** | `NP-09-PROMO-01`, `NP-10-QUAL-01`, `NP-11-QUAL-01`, `NP-10-ACCEPT-01` — all on this branch |
| **Authority decision** | Program Authority, 2026-10-04: **branch now; publication to `main` deferred as a separate, separately-authorized act** |
| **Disclosed tension** | `NP-13-D0-01` §7.4: *"The authorized path aligns with convention C-1 (`main` as authoritative for publication). It is in tension with convention C-2."* **GAP-6: "Durability conventions C-1 and C-2 are unreconciled."** |

**This record does not resolve GAP-6 and does not claim `main`-authoritative closure.** Any
publication to `main` is a distinct act requiring its own authorization.

---

## 13. Boundary statements (verbatim)

> **This acceptance does not constitute certification, production readiness, or production release**

> **Promotion of the implementation to `main` is not granted by this acceptance act unless separately and explicitly authorized.**

### 13.1 Corollaries

| Distinction | Statement |
| --- | --- |
| **Acceptance ≠ Qualification** | Qualification was granted by `NP-11-QUAL-01`. Acceptance is granted by this record. Separate acts |
| **Acceptance ≠ Certification** | No certification is granted, implied, or delegated. `NP-12 N4` certification is a separate gate |
| **Acceptance ≠ Production readiness** | Accepted as **non-production** |
| **Acceptance ≠ Promotion** | Implementation remains on `arena/01a0f351-iips-review-recovered`; **not** on `main` |
| **Acceptance ≠ G3 closure** | G3 remains **OPEN** (§8) |
| **Acceptance ≠ IPD admission** | No IPD artifact is admitted |
| **Acceptance ≠ failure closure** | The 2 pre-existing full-suite failures remain open |

---

## 14. Pre-acceptance recheck (all passed)

| # | Check | Result |
| --- | --- | --- |
| 1 | Qualification record exists remotely | **PASS** — blob `ff864782…`, 21,264 bytes, re-read from remote |
| 2 | Qualification commit exists remotely | **PASS** — `0e13ad48…` |
| 3 | Implementation commit exists | **PASS** — `0feceafd…`, reachable (ahead 9 / behind 0) |
| 4 | Governance record exists | **PASS** — `a75b346375e13e3c01a3d41a8bd8ef74567580f3` |
| 5 | No superseding adverse NP-11 disposition | **PASS** — none on any ref |
| 6 | No existing conflicting acceptance act | **PASS** — remote `contents` returned 404 before publication; corroborated by `NP-13-D0-01` §4.10 |
| 7 | Acceptance scope bounded | **PASS** — §5 |
| 8 | Acceptance authority established | **PASS** — Program Authority (Ramki), `NP-13-D0-01` §1.3 / §2.3; explicit authorization received 2026-10-04 |
| 9 | Intended repository/ref established | **PASS** — IRR `arena/01a0f351-iips-review-recovered`; C-1/C-2 tension disclosed at §12 |
| 10 | Worktree clean | **PASS** — 0 tracked modifications, 0 staged |
| 11 | No unrelated modifications | **PASS** — untracked files were prior gate reports only |

---

## 15. Mutation summary of this acceptance act

| Item | Value |
| --- | --- |
| Files added | **1** — this acceptance record |
| Files modified | **0** |
| Source files changed | **0** |
| Test files changed | **0** |
| Settings paths touched | **0** |
| Commits | **1** |
| Pushes | **1** |
| Promotions to `main` | **0** |
| IPD changes | **0** |

**This acceptance act carries no implementation change.** The accepted implementation is the
existing commit `0feceafdd9d948fc9b3c78edb075ccf52b254254`.

---

## 16. References

| Ref | Coordinate |
| --- | --- |
| Governance | `a75b346375e13e3c01a3d41a8bd8ef74567580f3` — `IIPS_v3.0_NP11_SETTINGS_PRODUCT_CONTRACT_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| Qualification | `0e13ad4815c0717d2b761a89d8d13e810ed99070` — `IIPS_v3.0_NP11_SETTINGS_NON_PRODUCTION_QUALIFICATION.md` (blob `ff864782461f1462747c304d077e354f5dc1ccf0`) |
| Implementation | `0feceafdd9d948fc9b3c78edb075ccf52b254254` |
| Membership jurisdiction | `NP-13-D0-01.md` (IRR `main`) — §1.3, §2.1, §2.3, §7.4, GAP-6 |
| Corroborating authority | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` (IRR `main`, root) — `D-N4-CERT-07` |
| Acceptance gate | `GATE-NP11-ACCEPTANCE-R1` |
| IPD reference baseline | `ramkivs/iips-production-market-data` @ `4d3e1cdca3a33da0ec3be8b336b17128108a502c` — reference only, 0 mutations |

---

**End of acceptance record `NP-11-ACCEPT-01`.**
