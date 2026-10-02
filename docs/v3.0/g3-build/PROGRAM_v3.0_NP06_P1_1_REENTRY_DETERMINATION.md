# IIPS v3.0 — NP-06 Reports P1.1 Re-entry Determination

## Determination Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-06-P1.1-R1 — TenantDirectory prerequisite re-entry determination

**Document type:** DEPENDENCY DETERMINATION — evaluates whether the previously withheld NP-06
Reports prerequisite has transitioned from dependency blocker to satisfied prerequisite.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository:** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref:** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**Baseline commit:** `0dad9d17d51ab2bbe648ad20a99e277bd65a653d`
**Baseline tree:** `30938da56bee861820ff36708c91e29c02fcffc8`

---

> ## DISPOSITION
>
> # P1.1 (production TenantDirectory) = **SATISFIED**
>
> # NP-06 P1 as a whole = **NOT SATISFIED**
>
> # REPORTS IMPLEMENTATION AUTHORITY = **REMAINS WITHHELD**

---

## 1. Naming precision — an important correction

The governing record is
`docs/integration/IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` (§6 "Dependency boundary").

**That authoritative record does not define a "P1.1 … P1.5" matrix.** It defines exactly two
dependency items — **P1** (owned by G3, product-tier principal enforcement) and **P2** (owned by
NP-04, common governed persistence) — each with a **bulleted, unnumbered** list of outstanding
requirements.

The identifier **"P1.1"** originates in the G3 governance stream, where it was used as a shorthand
for the **first bullet of P1**. This record therefore evaluates that bullet explicitly rather than
asserting a numbered matrix that does not exist authoritatively. Reporting a pre-existing "P1.1–P1.5
matrix" would have been an invention; it is not done here.

**Authoritative P1 — outstanding requirements (verbatim, §6):**

1. a **production** `TenantDirectory` (the current `ADMIN_DIRECTORY` is a hardcoded test map and
   does not satisfy this);
2. a **Reports resource gate** (the existing admin gate denies every non-`admin` action);
3. **`/api/reports/*` binding** to `SecuredExecutor` at the product transport tier;
4. **executed** 401 / 403 / ownership-binding proof.

**P1.1 := bullet 1.**

## 2. P1.1 criterion matrix (A–H)

| # | Criterion | Result | Evidence (authoritative repository state) |
|---|---|---|---|
| **A** | Durable implementation reachable from authoritative history | **PASS** | `frontend/server/tenant-membership-store.ts` present on the authoritative ref, blob `7ef1cec97e18ac202901013f12aeb4214fed5f15`. Introduced at `dce48d9d`, retained through `ab3176b9` / `0dad9d17`. |
| **B** | Live composition injects the authoritative directory; no fabricated fixture fallback | **PASS** | `admin-transport.ts:288` — `directory: new FileTenantDirectory({ path: membershipPath })` injected into `createLiveAdminExecutor`. `AdminExecutorDeps.directory` is **required** (`:256`, no `??` default). The identifier `ADMIN_DIRECTORY` survives **only inside three comments**; **zero** executable-position occurrences. The previous defect (live path → hardcoded five-identity map) was remediated at `ab3176b9` and re-verified at `fdcc8b0`/G3-Q-R1. |
| **C** | Fail closed when the authoritative store is absent/unavailable/corrupt | **PASS** | `admin-transport.ts:278` — `if (!membershipPath) return null;` (no directory ⇒ executor unavailable ⇒ 401). `tenant-membership-store.ts` raises `membership-state-unavailable` / `membership-state-corrupt`; `secured-executor.ts` converts a throwing directory into a governed **401**, never a default tenant. Independently reproduced in G3-Q-R1: fixture identities `admin-a`, `analyst-a`, `viewer-a`, `admin-b`, `analyst-b` all return **401 DENIED** through the live path. |
| **D** | Mutation cannot accept caller-constructed identity/Principal | **PASS** | `secured-executor.ts:195`, `:228` — mutation methods take `credential: unknown`, never a `Principal`. `authenticate()` (`:53`) is the sole principal-establishment path. A fabricated `Principal` passed as a credential yields **401** (verified at G3-Q and re-verified on the live-wired executor). |
| **E** | Bounded membership semantics, not expanded | **PASS** | Lookup read-only; assignment/revocation bounded; `cross-tenant-denied` (403); duplicate refused; `tenant-reassignment-forbidden` on any cross-tenant transition. `revoke(A)+assign(B)` cannot compose into a reassignment. Authorities per G3-DEP-3 (`0465f018`) and G3-DEP-1 (`c9df1c58`), both unchanged. |
| **F** | Persistence survives genuine process restart | **PASS** | Fresh **cross-process** verification at this commit: PID **1767** wrote the membership and exited; a separate OS process PID **1805** read it from disk. Not an in-process substitute. |
| **G** | Qualification authoritative; limitations not reinterpreted | **PASS** | G3-Q-R1 (`0dad9d17`, blob `760791b0d4bf`) = **QUALIFICATION SATISFIED**, `CERTIFICATION = NOT ESTABLISHED`. G3-Q v1.0 (`ecfb950b`) retained unmodified. The limitations G3-Q-R1 recorded (no full-suite run under the project's own tooling; three IPD suites out of scope and not executed; local discovery document with substituted verifier) are **not** reinterpreted as PASS in this record. |
| **H** | Governing acts authorize the capability; no later act supersedes | **PASS** | G3-B (`8c1fa9e41f76`) grants bounded implementation authority; G3-DEP-2 (`dda4462584ac`) designates `SecuredExecutor`; G3-DEP-3 (`0465f018119b`) bounds mutations; G3-DEP-1 (`c9df1c58631f`) prohibits reassignment. All founder records byte-identical on the authoritative remote; **no superseding or withdrawing act exists** (the governance stream tip `0dad9d17` is the latest act). |

**P1.1 = SATISFIED.** The specific deficiency named in the governing record — *"the current
`ADMIN_DIRECTORY` is a hardcoded test map and does not satisfy this"* — is remediated and
independently re-verified.

## 3. Reports consumer compatibility (§5)

The governing Reports contract (§1 R2, §4 C4) requires ownership keyed **exactly** on
`(tenantId, userId)`. The delivered principal contract is:

```
Principal = { userId, tenantId, roles }
```

(`iips-platform/src/distributed/EnterpriseRuntime.ts:15-19`)

| Requirement | Result |
|---|---|
| Principal supplies ownership context server-side | **SUFFICIENT** — `(tenantId, userId)` is exactly the ownership key |
| No `companyId` | **CONFIRMED** — zero executable occurrences in the G3 delivery (whole-file check across all five delivered artifacts). The single textual mention is a prohibition comment. |
| No `runtimeCompanyId` | **CONFIRMED** — same |
| No client-provided tenant ownership | **CONFIRMED** — tenant resolved only via `authenticate()` → `FileTenantDirectory` |
| No localStorage / sessionStorage identity | **CONFIRMED ABSENT** |
| No URL identity | **CONFIRMED ABSENT** — no `window.location`, no `URLSearchParams` in the delivery |
| No Reports-specific parallel identity mechanism | **CONFIRMED** — the G3 delivery introduces no new identity surface |

**Note (honesty):** a repository-wide scan finds executable-position `companyId` /
`runtimeCompanyId` in `frontend/server/executive-transport.ts`,
`frontend/server/pit/nonProductionPitStore.ts`, and `frontend/server/pit/pitD114RuntimeIntegration.test.ts`.
All three are **pre-existing** (last touched by baseline commit `19b42e7`) and are **not** part of
the G3 delivery. They are outside this gate's scope and are recorded here rather than silently
omitted. They do not affect P1.1, which concerns the TenantDirectory.

## 4. Remaining P1 and P2 status

| Condition | Status | Evidence |
|---|---|---|
| **P1 bullet 1** — production TenantDirectory | **SATISFIED** | §2 above |
| **P1 bullet 2** — Reports resource gate | **NOT SATISFIED** | `git grep` for a reports resource gate: **zero** matches. The existing admin gate denies every non-`admin` action. |
| **P1 bullet 3** — `/api/reports/*` binding | **NOT SATISFIED** | `git grep "/api/reports"`: **zero** matches. No route exists. |
| **P1 bullet 4** — executed 401/403/ownership-binding proof | **NOT SATISFIED** | Cannot exist absent bullets 2 and 3. The executed proof for the TenantDirectory path is **not** a Reports ownership-binding proof. |
| **P2** — NP-04 common governed persistence | **NOT SATISFIED** | NP-04 implementation authority was granted at `3807184`, but **no governed persistence implementation is present** in IRR (no `GovernedArtifactStore`, no NP-04 persistence module). NP-04 is out of scope for this gate; recorded read-only. |

Bullets 2–4 are **not** converted into PASS. Their absence of evidence is treated as absence of
satisfaction.

## 5. §2 authoritative-ref finding — material, recorded not suppressed

The gate instructed that the Arena ref not be treated as authoritative merely because it is the
current Arena ref. That instruction was tested, and the result is recorded:

- The governance stream (14 commits, `0caee9c` → `0dad9d17`) is reachable **only** from
  `refs/heads/arena/01a0f1b3-iips-review-recovered` on the authoritative GitHub remote.
- `origin/main` (`5ad7812bbe11acfc66e0b0e50c041fddaa63c20f`), `gai-impl-canonical`,
  `phase13-hardening-delivery`, and `phase13-next` **do not contain** any of it.
- `git merge-base origin/main origin/arena/01a0f1b3-iips-review-recovered` returns **no common
  ancestor** — the branch and `main` have **unrelated histories**.

**Consequence:** the G3 governance stream and this determination are durable on the authoritative
GitHub remote, but they are **not reconciled to `main`**. This record does not claim otherwise.
Reconciling the stream to `main` is a separate action requiring its own authority; it is outside
this determination gate and outside the branch scope available to this execution. It is recorded
here as an open reconciliation item.

This is a durability-scope limitation, not a defect in the P1.1 determination, which rests on
repository content that is verifiable on the authoritative remote.

## 6. Authority boundary — qualification vs certification

### 6.1 Correction to an overbroad prior statement

Earlier G3-Q records asserted flatly that *"no certification authority has been constituted."*
**Closer inspection shows that statement was overbroad, and it is corrected here.** An authority
**does** exist and **has** been exercised:

- `docs/v3.0/g3-build/PROGRAM_v3.0_G3_CERTIFICATION.md` — G3 adapter + enforcement certification.
- `docs/v3.0/g3-build/PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md` — **"G3 LIVE — APPROVED
  (maintainer)"**, covering real OIDC discovery/JWKS validation, real Principal construction,
  real tenant isolation (both directions), real RBAC 403, real 401, and real governed audit.

### 6.2 Consequence — the prior certification's tenant-resolution basis is superseded

The prior G3 certification explicitly covered tenant resolution:

- `PROGRAM_v3.0_G3_CERTIFICATION.md:33` — *"Candidate tenant from claims is platform-validated via
  `TenantDirectory`"*; `:87` — *"Tenant context platform-validated on every request
  ✅ (SecuredExecutor + TenantDirectory, tested)"*.
- `PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md:144` — *"tenant claim validated by TenantDirectory"*.

At the time those certifications were approved, the `TenantDirectory` in force on the live path was
the **hardcoded `ADMIN_DIRECTORY` fixture map** — precisely what the governing NP-06 record declares
*"is a hardcoded test map and does not satisfy this."*

The remediation at `ab3176b9` therefore **materially changed the artifact those certifications
covered**. The prior certification cannot be read as certifying the remediated behaviour, because it
was never executed against it. It remains valid for what it covered at its baseline; its
tenant-resolution element is **superseded** and requires re-certification.

### 6.3 Corrected status

| Level | Status |
|---|---|
| Implementation | **DONE** (`dce48d9d`, remediated `ab3176b9`) |
| Qualification | **SATISFIED** (G3-Q-R1, `0dad9d17`) |
| Certification authority | **EXISTS** — G3 certification, approved by maintainer |
| Certification **of the delivered TenantDirectory** | **NOT ESTABLISHED** — no certification act has been performed against the remediated capability; the prior act predates it |
| Reports implementation authority | **WITHHELD** |

Qualification of the *TenantDirectory dependency* is not certification of it, and neither is
implementation authority for Reports. Re-certification of the remediated tenant-resolution path is
an outstanding item, recorded here and **not** performed by this gate (§7 forbids establishing
certification).

## 7. Implementation-authority consequence

**The TenantDirectory is no longer the blocker for NP-06 P1 bullet 1.** That specific dependency is
discharged.

**Reports implementation authority nevertheless REMAINS WITHHELD**, because:
- three of P1's four outstanding requirements are unsatisfied (§4);
- P2 (common governed persistence) is unsatisfied;
- the governing record (§7) withholds authority *"pending P1/P2 dependency satisfaction and
  subsequent formal implementation-authority re-entry determination"* — a whole-P1/P2 condition,
  not a bullet-1 condition.

Every implementation prohibition in this gate was observed: **no** Reports implementation, **no**
`/api/reports/*`, **no** `ReportingEngine` change, **no** NP-04, **no** IPD, **no** D115, **no** G3
reopening, **no** certification act.

## 8. Exact next action

Grant implementation authority for the **remaining P1 bullets** under the already-authorized G3
mechanism — specifically, a bounded authority act permitting: the Reports resource gate, the
`/api/reports/*` binding to `SecuredExecutor` at the product transport tier, and the executed
401 / 403 / ownership-binding proof.

This is **not** a new gate. It is the *"subsequent formal implementation-authority re-entry
determination"* the governing record §7 already names, scoped to the **remaining** P1 bullets —
the TenantDirectory bullet being discharged here.

Two further items are recorded as open and are **not** discharged by this gate:

1. **Re-certification** of the remediated tenant-resolution path (§6.2). The prior G3 LIVE
   certification was approved against the `ADMIN_DIRECTORY` fixture; the remediation materially
   changed that artifact. Certification is not established by this record and no certification act
   is performed here.
2. **Stream reconciliation to `main`** (§5). The governance stream is carried solely by the Arena
   ref; `main` shares no common ancestor with it.

P2 remains a separate NP-04-owned dependency and is unaffected by this determination. It is out of
scope for this gate and is not addressed further here.
