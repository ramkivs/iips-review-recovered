# IIPS v3.0 — NP-06 Reports Implementation Authority Activation

## Implementation Authority Decision Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-06-R1 — Formal activation of Reports implementation authority

**Document type:** IMPLEMENTATION AUTHORITY ACTIVATION — records that the condition withholding
Reports implementation authority has been satisfied and that the authority is now **ACTIVATED**
under the bounded scope below. Not a certification, release, or production authority.

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository (governance):** `ramkivs/iips-review-recovered`
**Authoritative remote:** `https://github.com/ramkivs/iips-review-recovered.git`
**Authoritative ref (governance):** `refs/heads/arena/01a0f1b3-iips-review-recovered`

**IRR baseline at activation:**
`98ff14f309a439d2c74fc2275d39c3cb90118ae9` (tree `95217db266c419e537c67ce51b4ab4088503a776`)

**Authorized implementation repository:** `ramkivs/iips-production-market-data` (IPD)
**IPD persistence baseline:**
`np04-governed-persistence-windows@bd5229d01955feb0757bb1aa33252f9dc49dd68f`
(tree `4844be6b3d7f7f6878cb37c2a3568f596e9fc14e`)

**Status:** **ACTIVATED — NP-06 REPORTS IMPLEMENTATION AUTHORITY (NON-PRODUCTION, BOUNDED)**

**Supersedes nothing.** This record does not amend, reinterpret, or reopen any prior record. It
activates authority whose withholding was itself recorded by NP-06 §7.

---

> ## STATUS
>
> # NP-06 REPORTS IMPLEMENTATION AUTHORITY = **ACTIVATED**
>
> # P1 (product-tier principal enforcement) = **SATISFIED**
>
> # P2 (common governed persistence) = **SATISFIED**
>
> # REPORTS IMPLEMENTATION = **NOT PERFORMED BY THIS RECORD**

---

## 1. Authority previously withheld

NP-06 §7 (*Current disposition*) of `IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md`
(blob `15a6fe888727fc5e26e354ecd8a6e9fd99f510e1`) states verbatim:

> **Reports implementation authority remains WITHHELD pending P1/P2 dependency satisfaction and
> subsequent formal implementation-authority re-entry determination.**

The same section records that no Reports product implementation then existed: no `/api/reports`, no
Reports feature directory, no Reports API client, no Reports product route, no Reports navigation
implementation, and no Reports persistence implementation.

That withholding condition is **conjunctive over P1 and P2**, and additionally required a
**subsequent formal implementation-authority re-entry determination**. All three parts are now
satisfied, and this record records the activation.

## 2. Dependency satisfaction — independently determined

Both dependencies were **re-verified against current authoritative state** rather than accepted from
prior reporting. Method: all evidence was read from the committed authoritative remote objects (the
Arena sandbox had reset locally; the authoritative ref was used directly), and test evidence was
produced by extracting the authoritative ref into an isolated directory and executing there.

### P1 — Reports product-tier principal enforcement (owned by G3): **SATISFIED**

Recorded by IRR commit **`98ff14f309a439d2c74fc2275d39c3cb90118ae9`**, which changed exactly three
files:

| File | Blob | Change |
|---|---|---|
| `frontend/server/reports-transport.ts` | `b3ed35fb6d3a95bf6c5ed37a959e916aa6e53766` | ADD |
| `frontend/server/reports-transport.test.ts` | `4ae07780541a03a94fac01ef0e38380eb652919e` | ADD |
| `frontend/server/executive-transport.ts` | `bcb929ddfee357af87340bae0e063feb05346213` | MODIFY (+19/−0) |

The four P1 requirements of NP-06 §6 are each satisfied:

1. **Production `TenantDirectory`** — `FileTenantDirectory` (`tenant-membership-store.ts:88`) is the
   **only** class implementing `TenantDirectory`; the hardcoded map is retained strictly as an
   explicitly-named test fixture (`TEST_TENANT_DIRECTORY`) and the live path injects the durable
   membership store (`admin-transport.ts:283,288`).
2. **Reports resource gate** — `reportsResourceGate` recognises the governed `read` action within
   the `reports.*` resource namespace over a closed reader-role set.
3. **`/api/reports/*` binding** — bound to `SecuredExecutor` at the product transport tier
   (`executive-transport.ts:591`), with the executor obtained through the established
   `createLiveAdminExecutor(gate)` composition seam.
4. **Executed 401 / 403 / ownership-binding proof** — **44 tests, executed, 44 passed / 0 failed**
   over real HTTP.

The same enforcement chain used by the admin and AI-advisory tiers is reused; no second
authentication or authorization primitive was introduced, and none of `admin-transport.ts`,
`ai-advisory-transport.ts`, or `secured-executor.ts` was modified by G3.

### P2 — Common governed persistence (owned by NP-04): **SATISFIED**

Recorded durably on IPD branch `np04-governed-persistence-windows` at
**`bd5229d01955feb0757bb1aa33252f9dc49dd68f`** (tree
`4844be6b3d7f7f6878cb37c2a3568f596e9fc14e`).

| P2 evidence | Value |
|---|---|
| Application commit (parent = baseline `4d3e1cdc…`) | `d61ff9c097feb1be8a086f737f78b314ef6cdb10` |
| Its tree | `fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb` — the value predicted in Arena **before** handoff |
| All 9 authoritative persistence blobs vs the durably recorded values | **9/9 MATCH** |
| Dedicated NP-04 verification (re-executed against authoritative IPD bytes) | **22 pass / 0 fail / 2 suites**; `tsc` exit 0 |
| Five operations | `createInstance`, `appendVersion`, `resolveById`, `queryByOwner`, `listSupersededBy` (`store.ts:268,288,330,345,381`) |
| Durability substrate | `node:sqlite` `DatabaseSync` (`db.ts:13`); restart-durability and on-disk tests present |
| Immutability / atomicity | `BEFORE UPDATE` / `BEFORE DELETE` triggers with `RAISE(ABORT)` (`schema.ts:102,107`); explicit `ROLLBACK` (`store.ts:167-172`) |
| Instance identity | `randomUUID()` minted — **not** content-derived (`identity.ts:25`) |

### Re-entry determination: **A — IMPLEMENTATION AUTHORITY MAY PROCEED**

A formal NP-06 Reports Implementation-Authority Re-entry Determination was performed against the
then-current authoritative state and returned disposition A. Its evidence is fully traceable: the
G3 implementation commit `98ff14f` (durable, above) and the IPD NP-04 commit `bd5229d0` (durable,
above). The determination was executed as an Arena investigation; **this record is the durable
instrument of its result and of the resulting activation.**

## 3. No new blocker since the determination

Verified at activation time:

- the governance ref tip **is** the G3 commit `98ff14f` — **no intervening commit**;
- `docs/handoff/` remains untracked by decision and is not part of governance state;
- IPD `np04-governed-persistence-windows` is unchanged at `bd5229d0…`; IPD `main` unchanged at
  `4d3e1cdc…`;
- `ReportingEngine.ts` blob is unchanged at `1149864a8c43e8b885eee2c4a9a1ce869dd8f338`
  (sha256 `5eaf7968738ad36dff3f4705cd27509bc05a9849fc7b3a14297943d0527ad8d1`);
- no dependency or lockfile change was introduced by G3;
- IU-7 and IU-8 remain closed and untouched.

**No new blocker exists.**

## 4. Authority scope — ACTIVATED

Implementation authority is activated **only** for the NP-06 Reports implementation scope already
established by the accepted governance decisions (R1–R5, D3, D8, G11, C1–C4, and the §5 readiness
annex). The authority covers implementation of:

- canonical Reports product artifact composition;
- durable Reports persistence consumption **through NP-04**;
- Reports product transport / API;
- Reports product UI / surface;
- deterministic `reportKey`;
- durable `reportId`;
- `artifactVersion`;
- `supersedesReportId`;
- ownership `(tenantId, userId)`;
- required Reports validation and security behavior;
- Reports qualification evidence.

### Explicitly NOT authorized

- production deployment;
- production market-data work;
- changes to D115 authority;
- invention of `companyId` / `runtimeCompanyId`;
- replacement of the established authentication/authorization architecture;
- changes to `ReportingEngine` semantics;
- changes to the NP-04 persistence architecture unless separately required and **explicitly**
  authorized;
- reopening IU-7 / IU-8;
- unrelated product workstreams.

## 5. Implementation constraints that remain binding

The accepted Reports decisions are preserved without amendment:

- Reports is the **seventh L1 product section**, a sibling of — not nested within — existing product
  sections; initial scope is **cross-sector**.
- `ReportingEngine` remains the **frozen CSIP source**. Reports is a **product-tier composition
  stage**, never a relocation of `ReportingEngine`.
- `reportKey` is deterministic **content** identity; `reportId` is globally unique durable
  **instance** identity. The frozen engine's content-derived identifier must never be used as
  durable instance identity.
- `artifactVersion` begins at `1` and increments only for an authorized new lifecycle version;
  supersession is **append-only and single-parent**.
- Ownership is `(tenantId, userId)`, derived **only** from the authenticated principal; the principal
  contract remains `{ userId, tenantId, roles }`; tenant identity remains server-authoritative.
- **No client-supplied identity becomes authoritative.** No `companyId` or `runtimeCompanyId` is
  introduced, and neither may gain authority.
- Persistence is consumed through the **NP-04 common governed persistence foundation**. **No
  Reports-specific persistence store is created.**
- The **canonical structured report artifact is primary**; UI and export are projections.

## 6. No implementation performed by this record

This record is an **authority activation and durability step only**. It performs no Reports
implementation. It does not modify `ReportingEngine`, NP-04 persistence, IU-7, or IU-8, and it does
not create another Reports governance or specification gate. The only repository mutation performed
by this recording action is the addition of this governance record to the IRR governance home.

## 7. Next phase

**Reports implementation under this bounded authority.** The next phase implements the Reports
capability within the scope activated in §4 and the constraints in §5, beginning with the first
bounded implementation step and proceeding only within the activated boundaries.

Authority activation is **not** implementation completion, and it is **not** certification,
qualification, or release readiness. No production authority is granted by this record.

---

*End of record.*
