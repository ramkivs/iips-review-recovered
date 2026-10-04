# IIPS v3.0 — NP-10 UI10 Collaboration — ACCEPTANCE AND BASELINE ADMISSION

**Record ID:** NP-10-ACCEPT-01
**Date:** 2026-10-04
**Repository:** `ramkivs/iips-review-recovered` (**IRR**)
**Ref:** `arena/01a0f351-iips-review-recovered`
**Status:** **ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

> ### **NP-10 COLLABORATION — ACCEPTED FOR ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**

---

## 1. Acceptance decision

The **NP-10 UI10 Collaboration** capability, as qualified by `NP-10-QUAL-01`, is hereby
**ACCEPTED INTO THE ACTIVE NON-PRODUCTION IRR FEATURE BASELINE**.

Acceptance is granted on the basis of a completed qualification, a verified governance
ancestry, an executed regression profile showing no new failures, and an explicit
authorization by the sole Acceptance Authority.

---

## 2. Accepting authority

| Field | Value |
| --- | --- |
| **Accepting Authority** | **Program Authority — Ramki (Ramakrishnan)** |
| **Authority basis** | **`NP-13-D0-01.md`** (IRR `main`, `docs/integration/`) — **Signer: Ramki (Ramakrishnan), Program Authority; Status: D0 — ESTABLISHED / JURISDICTION DESIGNATED; Ratification: RATIFIED; 2026-10-02.** §1.3 vests **"Feature-baseline DEFINITION + COMPOSITION + MEMBERSHIP"** in the designated holder; §3.9 confirms *"Membership is within jurisdiction (§1.3, J-3) but no membership determination is made by this record"*; §8 establishes the holder (§2.1), the subject matters J-1 / J-2 / **J-3 membership**, and that **each exercise be its own explicit act** (§2.3). `NP-13-D0-01` §4.8 names **NP-10** among the membership determinations, and §4.10 recorded *"NP-10 and NP-11 membership gaps — neither has any acceptance or promotion record on any ref"* |
| **Authority status** | **Corrected 2026-10-04 (AN-05).** The record originally cited the NP-12-scoped `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` as its authority basis. That citation was **mis-scoped** and has been replaced by `NP-13-D0-01`. See §2.2 |
| **Authorization act** | Explicit acceptance authorization granted by Program Authority during `GATE-NP10-ACCEPTANCE-R1`, 2026-10-04 |
| **Decision date** | 2026-10-04 |

### 2.1 Execution and provenance

| Role | Actor |
| --- | --- |
| **Acceptance decision (authority)** | Ramki (Ramakrishnan) — Program Authority |
| **Authorization recorded** | `GATE-NP10-ACCEPTANCE-R1` §2, and the authorization election of 2026-10-04 |
| **Investigation, verification, and record execution** | `arena-agent` — acting under that authorization, not as the authority |

The investigation, evidence verification, drafting, commit, and push were executed by
`arena-agent`. **The acceptance decision itself is the act of Program Authority.** The
agent holds no acceptance authority of its own and claims none.

### 2.2 Authority-citation rectification (`AN-05`) — 2026-10-04

**This is a citation/governance-record correction. It is not a new acceptance act, and it does
not alter the acceptance decision, scope, evidence, or authorization history of this record.**

**Before → Evidence → Correction → Reason**

| | |
| --- | --- |
| **Before** | This record's **Authority basis** (§2) and **References** (§15) cited `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` (`D-N4-CERT-07`: *"Program Authority (Ramki / Ramakrishnan) is the sole Acceptance Authority"*) as the authority basis for NP-10 acceptance |
| **Evidence** | `NP-12-N4-A15` is rendered within the **NP-12 N4 certification-envelope** context. Its `D-N4-CERT-06` explicitly limits the parallel certification authority to `N4-SD`, `N4-A10`, `N4-A13` and the combined `NP-12 N4` envelope. Read strictly, it is **not** a program-wide acceptance-authority instrument and does **not** govern NP-10. Conversely, `NP-13-D0-01` **does** govern: §1.3 vests feature-baseline **MEMBERSHIP** in the designated holder, §4.8 **names NP-10** among the membership determinations, and §4.10 recorded the NP-10 membership gap this record closes |
| **Correction** | The operative authority basis is restated as **`NP-13-D0-01` §1.3 / §2.1 / §2.3 / §3.9 / §4.8 / §4.10**. `NP-12-N4-A15` is retained only as **corroboration of the Program Authority role**, explicitly marked **not operative** |
| **Reason** | Prevent NP-12-specific authority from being reused as acceptance authority for another workstream. The underlying disposition is **unchanged**: Program Authority (Ramki) authorized this acceptance explicitly on 2026-10-04 |

**Explicitly preserved by this rectification:** the acceptance decision (`NP-10-ACCEPT-01`),
the accepted scope, the qualification reference (`689d5c8f…`), the implementation coordinate
(`ba8ea1df…`), all evidence, and the authorization history. **Nothing substantive changed.**

**Explicitly not affected:** NP-12 `N4-A15` and `N4-A16` are unmodified; NP-12 remains
`COMPLETED / CLOSED / CERTIFIED AND ACCEPTED` within its approved N4 envelope.

---

## 3. Qualification prerequisite

| Field | Value |
| --- | --- |
| **Qualification record** | `NP-10-QUAL-01` — `IIPS_v3.0_NP10_COLLABORATION_NON_PRODUCTION_QUALIFICATION.md` |
| **Qualification commit** | `689d5c8f586d6cffccde42199bed1834361acfe8` |
| **Qualification artifact blob** | `74d7808285b4e105e954f2b3f46285e95a9f163b` (16,416 bytes) |
| **Qualification result** | **QUALIFIED — NON-PRODUCTION** |

The qualification record was **remotely verified and re-read** from the authoritative ref
prior to this act. It states, verbatim:

> **"CERTIFICATION IS NOT GRANTED by this record."**
> **"ACCEPTANCE IS NOT GRANTED by this record."**
> **"Promotion to `main` is NOT authorized by this record"** and was not performed.

Acceptance is therefore a **new and separate act**, taken here, and is not a restatement
or extension of the qualification.

---

## 4. Accepted coordinates (exact)

| Coordinate | Value |
| --- | --- |
| **Governance** | `f5a56477ade2d4bf629c7df614c1dd1505901f1f` — 2026-09-30T19:28:28Z — *"docs(np10): record Collaboration Product Contract, Scope & Persistence Owner Designation"* — `docs/integration/IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| **Implementation** | `ba8ea1df74b10be5ed46bc12494ec1f651a20235` — 2026-09-30T19:52:09Z — *"feat(collaboration): implement NP-10 UI10 Collaboration under NP-10-AUTH-01"* — author `ramkivs` |
| **Qualification** | `689d5c8f586d6cffccde42199bed1834361acfe8` |
| **Acceptance (this record)** | `NP-10-ACCEPT-01` |
| **Repository / ref** | `ramkivs/iips-review-recovered` (IRR) @ `arena/01a0f351-iips-review-recovered` |

### 4.1 Implementation surface (from `ba8ea1df74b10be5ed46bc12494ec1f651a20235`)

```
frontend/server/collaboration/collaboration-resolvers.ts
frontend/server/collaboration/collaboration-route-integration.test.ts
frontend/server/collaboration/collaboration-service.test.ts
frontend/server/collaboration/collaboration-service.ts
frontend/server/collaboration/collaboration-transport.test.ts
frontend/server/collaboration/collaboration-transport.ts
frontend/server/executive-transport.ts
frontend/src/api/collaboration.ts
frontend/src/app/App.test.tsx
frontend/src/app/App.tsx
frontend/src/app/navigation.ts
frontend/src/app/routes.ts
frontend/src/features/collaboration/Collaboration.test.tsx
frontend/src/features/collaboration/Collaboration.tsx
```

The implementation exists on `arena/01a0f351-iips-review-recovered` and is **not present on
IRR `main`**. No source file was created, modified, or deleted by this acceptance act.

---

## 5. Accepted scope

Acceptance covers **exactly the scope qualified by `NP-10-QUAL-01`**, and nothing beyond it.

| Scope element | Accepted state |
| --- | --- |
| **Product boundary** | NP-10 Collaboration: comment threads and watchlist citations |
| **Governed reference set** | **CLOSED** — `company` \| `evidence` \| `watchlist`. Any other entity type fails **closed (404)** |
| **Private / user-owned semantics** | Enforced — *"records tenant and owner from the CALLER, never from the payload"*; *"another owner in the same tenant sees nothing"*; the private model and excluded capabilities are disclosed |
| **Tenant-scoped boundary** | Enforced — *"another tenant sees nothing"*; *"two tenants may hold identically titled threads independently"*; *"a different tenant sees no threads"* |
| **Persistence** | Gate-P Class C append-only event journal |
| **Watchlists integration** | *"resolves watchlist citations through the owner-scoped authority only"*; *"cites a watchlist the principal owns, and rejects one they do not"* |
| **Security** | Unauthenticated → **401**; viewer mutation → **403**; cross-principal access → **404** (no-disclosure); tenant/token mismatch → **401** |
| **Operational limitation** | **NON-PRODUCTION** |

---

## 6. Persistence boundary

| Field | Value |
| --- | --- |
| **Class** | Gate-P **Class C** append-only event journal |
| **Location** | `IIPS_DATA_DIR/collaboration/journal.ndjson` |
| **Ownership** | **IRR Server Tier** (designated by NP-10-AUTH-01) |
| **Restart durability** | In-process journal reconstruction |
| **Not included** | Out-of-process authenticated HTTP restart durability; external/datastore persistence; cross-service durability |

---

## 7. Security boundary

| Element | State |
| --- | --- |
| **Identity derivation** | `tenantId` and `userId` are derived **server-side from the authenticated principal**, never from the request payload |
| **Unauthenticated** | **401** |
| **Insufficient privilege (viewer mutation)** | **403** |
| **Cross-principal / cross-tenant access** | **404 — no-disclosure** (existence is not leaked) |
| **Tenant / token mismatch** | **401** |
| **Authorization scope** | UI10 Collaboration and its governed reference set only |

---

## 8. Evidence basis for acceptance

| # | Evidence | Result |
| --- | --- | --- |
| 1 | Governance ancestry | `f5a56477…` → `ba8ea1df…` verified remotely |
| 2 | NP-10 focused suite | **94 / 94 passed** (88 NP-10 cases + 6 pre-existing non-NP-10 `App.test.tsx` shell cases) |
| 3 | NP-10 case count | **88** cases newly added by `ba8ea1df…` |
| 4 | Gate-P regression | **21 / 21** |
| 5 | NP-09 Watchlists regression | **56 / 56** |
| 6 | Full-suite delta | **349 passed / 2 failed / 25 skipped → 437 passed / 2 failed / 25 skipped** — **`+88` passed, **0 new failures**, failed and skipped counts identical |
| 7 | Typecheck | **PASS (exit 0)** |
| 8 | Build | **PASS (exit 0)** |
| 9 | Typecheck + build + execution | All re-verify the qualification result |
| 10 | Pre-existing failures | **2** — `product-transport` taxonomy; `pitRuntimeIntegration` IU5R-13. **Not NP-10-induced**, unchanged by NP-10, and **not** closed by this acceptance |
| 11 | Acceptance-state sweep | **0** NP-10 acceptance or promotion acts across **all 50 IRR branches** and **all 33 IPD branches** prior to this record |
| 12 | Superseding adverse act | **NONE** on any ref |

### 8.1 Note on the `94` figure

**`94` is the size of the focused suite that was run, not the NP-10 case count.** One NP-10
case was added to the pre-existing `App.test.tsx`; running that file pulled in its 6
pre-existing, non-NP-10 shell cases. `88 + 6 = 94`. The claim *"94/94 focused tests passing"*
is **accurate as a suite result** and is **verified by execution**.

---

## 9. Known limitations

1. **Restart durability is in-process journal-reconstruction only.** It does not cover
   out-of-process authenticated HTTP restart durability.
2. **Non-production identity.** The accepted capability operates under non-production
   identity assumptions.
3. **G3 remains OPEN.** The Gate-P Class C persistence feature decision is a separate
   unresolved boundary. It is **not** closed by this acceptance and is **not** claimed as
   closed.
4. **Two pre-existing full-suite failures remain open** (`product-transport` taxonomy,
   `pitRuntimeIntegration` IU5R-13). They are not NP-10-induced and are not closed here.

---

## 10. Explicit exclusions

The following are **explicitly excluded** from this acceptance:

* Any **IPD** implementation or IPD-side artifact
* **Production** deployment, production identity, or **production Keycloak/OIDC**
* **Live market data** or **broker** integration
* **Mentions, assignments, roster, ACLs, and invitations**
* **Unpromoted Reports** references and **raw provider references**
* **Concurrency / load qualification**
* **Out-of-process authenticated HTTP restart durability**
* **Certification** of any kind
* **Promotion of the implementation to `main`**
* Any capability outside the qualified NP-10 Collaboration scope

---

## 11. Boundary statements (verbatim)

> **This acceptance does not constitute certification, production readiness, or production release**

> **Promotion of implementation to `main` is not granted by this acceptance act unless explicitly included and authorized as a separate decision.**

### 11.1 Corollaries

| Distinction | Statement |
| --- | --- |
| **Acceptance ≠ Qualification** | Qualification was granted by `NP-10-QUAL-01` at `689d5c8f…`. Acceptance is granted by this record. They are separate acts |
| **Acceptance ≠ Certification** | No certification is granted, implied, or delegated |
| **Acceptance ≠ Production readiness** | The capability is accepted as **non-production** |
| **Acceptance ≠ Promotion** | The implementation remains on `arena/01a0f351-iips-review-recovered` and is **not** on `main` |
| **Acceptance ≠ IPD admission** | No IPD artifact is admitted by this record |

---

## 12. Pre-acceptance recheck (all passed)

| # | Check | Result |
| --- | --- | --- |
| 1 | Qualification record exists remotely | **PASS** — blob `74d78082…`, 16,416 bytes, re-read from remote |
| 2 | Qualification commit exists | **PASS** — `689d5c8f…` |
| 3 | Implementation commit exists | **PASS** — `ba8ea1df…` |
| 4 | Governance record exists | **PASS** — `f5a56477…` |
| 5 | Qualification scope not contradicted by later evidence | **PASS** — no later NP-10 artifact exists |
| 6 | No superseding adverse NP-10 act | **PASS** — none on any of 50 IRR + 33 IPD branches |
| 7 | Acceptance record path verified not pre-existing | **PASS** — remote `contents` returned 404 prior to publication |
| 8 | Worktree clean at time of acceptance | **PASS** — 0 tracked modifications, 0 staged |
| 9 | No unrelated modifications | **PASS** — untracked files were prior gate reports only |

---

## 13. Prerequisites D1–D7 (all satisfied)

| ID | Prerequisite | Result |
| --- | --- | --- |
| **D1** | Qualification | **SATISFIED** — QUALIFIED — NON-PRODUCTION, remotely verified |
| **D2** | Governance | **SATISFIED** — NP-10-AUTH-01 permits the implementation; contains no prohibition on acceptance |
| **D3** | Scope | **SATISFIED** — accepted scope matches qualified scope exactly |
| **D4** | Regression | **SATISFIED** — Gate-P 21/21, NP-09 56/56, `+88` passed, **0 new failures** |
| **D5** | Persistence | **SATISFIED** — Gate-P Class C boundary unchanged since qualification |
| **D6** | Security | **SATISFIED** — qualified identity/tenant/security boundary still applicable |
| **D7** | Production boundary | **SATISFIED** — explicitly non-production |

---

## 14. Mutation summary of this acceptance act

| Item | Value |
| --- | --- |
| Files added | **1** — this acceptance record |
| Files modified | **0** |
| Source files changed | **0** |
| Test files changed | **0** |
| Commits | **1** |
| Pushes | **1** |
| Promotions to `main` | **0** |
| IPD changes | **0** |

**This acceptance act carries no implementation change.** The accepted implementation is the
existing commit `ba8ea1df74b10be5ed46bc12494ec1f651a20235`.

---

## 15. References

| Ref | Coordinate |
| --- | --- |
| Governance | `f5a56477ade2d4bf629c7df614c1dd1505901f1f` — `IIPS_v3.0_NP10_COLLABORATION_GOVERNANCE_AND_PERSISTENCE_OWNER_DESIGNATION.md` |
| Qualification | `689d5c8f586d6cffccde42199bed1834361acfe8` — `IIPS_v3.0_NP10_COLLABORATION_NON_PRODUCTION_QUALIFICATION.md` |
| Implementation | `ba8ea1df74b10be5ed46bc12494ec1f651a20235` |
| Acceptance gate | `GATE-NP10-ACCEPTANCE-R1` |
| Authority — **operative** | `NP-13-D0-01.md` (IRR `main`, `docs/integration/`) — §1.3 / §2.1 / §2.3 / §3.9 / §4.8 / §4.10. **Corrected 2026-10-04 (`AN-05`)** |
| Authority — corroborating, **not operative** | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` (IRR `main`, root) — `D-N4-CERT-07`. NP-12-scoped; **not** the authority basis for NP-10 |
| Rectification | `AN-05` — authority-citation correction, 2026-10-04; see §2.2 |

---

**End of acceptance record `NP-10-ACCEPT-01`.**
