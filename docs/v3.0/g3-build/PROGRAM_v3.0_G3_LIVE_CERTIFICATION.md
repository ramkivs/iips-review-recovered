# PROGRAM v3.0 — G3 LIVE Deployment & Certification Report

> **Status:** **G3 LIVE — APPROVED (maintainer).** All seven LIVE-readiness gates are green in the
> local deployment. Formal **Phase 12 authorization** remains a separate, explicit decision with
> its own scope/contract/implementation/certification gates.
>
> **Reference SNAPSHOT:** remains the active safe experience.
> **Tenant-scoped live engine execution:** proven in the local certification deployment using
> deterministic test market-data fields. **Production external-data integration remains a
> separate deployment/data-source gate** and is NOT part of this G3 certification.

---

## 1. Executive summary

The G3 boundary was previously **CERTIFIED at the adapter + enforcement (unit/contract) level**
with one outstanding LIVE criterion (#6: *authenticated tenant-scoped live engine output*). This
milestone closes that gap by **provisioning a real local Keycloak** and proving the complete
authenticated, tenant-scoped, live-computed path **end-to-end** — empirically, against a genuine
OIDC authority, not a mock.

| Item | Prior status | Now |
|---|---|---|
| G3 Adapter + Enforcement | ✅ CERTIFIED (unit/contract) | ✅ CERTIFIED |
| G3 OIDC authority (Keycloak) | ⏳ configured, unproven | ✅ **provisioned + running (real)** |
| Real OIDC discovery + JWKS signature validation | ❌ mock only | ✅ **real, verified against realm JWKS** |
| Real authenticated Principal | ❌ mock | ✅ **real token → governed Principal** |
| Real tenant isolation (ALLOW/DENY) | ✅ unit | ✅ **real, both directions** |
| Real RBAC (403) | ✅ unit | ✅ **real** |
| Real 401 (missing/invalid/malformed) | ✅ unit | ✅ **real HTTP boundary** |
| Real governed audit (allow + deny) | ✅ unit | ✅ **real** |
| **Criterion #6: tenant-scoped LIVE engine output** | ❌ **NOT YET** | ✅ **PROVEN (local deployment)** |
| Golden-output provenance rule | ✅ preserved | ✅ preserved |
| Reference SNAPSHOT | ✅ ACTIVE | ✅ ACTIVE |
| **G3 LIVE certification** | 🔒 NOT certified | ✅ **APPROVED (maintainer)** |
| Production external market-data integration | — | ⏸ **NOT part of G3 (separate data-source gate)** |
| **Phase 12 (Administration)** | 🔒 BLOCKED | 🔒 **ELIGIBLE — awaiting explicit authorization** |

---

## 2. Environment & deployment executed

The approved local/self-hosted Keycloak architecture was provisioned **in this environment**:

```
┌──────────────────────────────────────────┐
│          LOCAL IIPS ENVIRONMENT          │
│  Browser / headless client               │
│     │   (real OIDC token)                │
│     ▼                                    │
│  G2 / Secured Transport (SecuredExecutor)│
│     │                                    │
│     ├───────────────┐                    │
│     ▼               ▼                    │
│ Keycloak :8080  EnterpriseRuntime +      │
│   realm `iips`     DataGovernance +      │
│   client `iips-spa` LiveDataRuntime      │
│     │               │                    │
│     │               ▼                    │
│     └── OIDC ───────► Certified Engines   │
└──────────────────────────────────────────┘
```

- **Keycloak 19.0.3** (Java 11-compatible) running `start-dev`, port **8080**.
- Realm **`iips`**; OIDC client **`iips-spa`** (public; authorization-code + PKCE in production;
  **direct-access-grant enabled as a dev/test convenience only** so the headless test can obtain
  real tokens).
- Governed realm roles: **`iips-admin` / `iips-analyst` / `iips-viewer`**.
- Development users: **admin-a / analyst-a / viewer-a** (tenant-A), **analyst-b** (tenant-B).
- **Protocol mappers** on `iips-spa`:
  - **Audience mapper** → access-token `aud` includes `iips-spa`.
  - **User-attribute mapper** → user attribute `tenant` → access-token claim `tenant`
    (so the platform can validate tenant context; never trusted from URL/state/localStorage).
- All credentials are environment-controlled / test-only; **no secrets committed to git.**

Provisioning is automated in `frontend/server/live/keycloak-provision.mjs`.

---

## 3. Real OIDC verification (JWKS RS256)

`frontend/server/live/real-oidc-verifier.ts` (`RealKeycloakVerifier`) performs **real** OIDC
validation, closing the previous mock seam:

1. Discovers realm metadata (issuer, JWKS URI) from
   `{KC}/realms/iips/.well-known/openid-configuration`.
2. Fetches the realm's **real JWKS**.
3. Validates the token's **RSA signature (RS256)** over `header.payload` with WebCrypto using the
   realm's signing key (matched by `kid`).
4. Guards issuer + audience + expiry.

Verified against a live-decoded Keycloak token:

```json
{
  "sub": "075591b0-…",
  "iss": "http://localhost:8080/realms/iips",
  "aud": ["iips-spa", "account"],
  "realm_access": { "roles": ["iips-analyst", "…"] },
  "tenant": "tenant-A",
  "preferred_username": "analyst-a"
}
```

---

## 4. Live integration test evidence

`frontend/server/live/live-tenant-engine.test.ts` — **8/8 PASS** against the real Keycloak.
Automatically **skips** (offline-safe) when no Keycloak is reachable, so the default regression
gate is unaffected.

| # | Live test | Result |
|---|---|---|
| 1 | Real OIDC discovery + real JWKS signature verification | ✅ PASS |
| 2 | Real authenticated token → governed Principal (subject/tenant/roles) | ✅ PASS |
| 3 | Real tenant isolation: A→A ALLOW, A→B DENY, B→B ALLOW, B→A DENY | ✅ PASS |
| 4 | Real RBAC: viewer `execute` → 403; analyst/admin `execute` → allow | ✅ PASS |
| 5 | Real 401: missing / malformed / garbage tokens | ✅ PASS |
| 6 | Governed audit entries (allow + deny) with user identity + tenant | ✅ PASS |
| 7 | **Real HTTP boundary** emits 401/403; cross-tenant 403; viewer-read 200 / viewer-execute 403 | ✅ PASS |
| 8 | **Tenant-scoped LIVE engine output** computed from a tenant-owned data snapshot | ✅ PASS |

### 4.1 Criterion #6 — the outstanding gate (now proven)

A **tenant-owned, ingested data snapshot** is created via the certified
`LiveDataRuntime.MarketDataSource` and **classified** as owned by **tenant-A** in
`DataGovernanceRuntime`. The **certified BankingEngine** is then executed **live** on that
snapshot through the real container/runtime wiring (`DataBoundExecutor`), producing a composite
score + verdict **computed by the engine at run time**.

- **Tenant-A** (real Keycloak Principal) → authorize + `isTenantResource` +
  `DataGovernanceRuntime.canAccess` **ALLOW** → the live-computed output is returned.
- **Tenant-B** (real Keycloak Principal) → **DENIED** server-side (governance + tenant + HTTP 403).

**Source lineage (honest, exact):**

```
Real Keycloak login (realm iips) 
  → real OIDC token 
  → RealKeycloakVerifier (real JWKS RS256) 
  → KeycloakSessionValidator 
  → SecuredExecutor.authenticate → governed Principal 
  → tenant claim validated by TenantDirectory 
  → EnterpriseRuntime RBAC + DataGovernance.canAccess + isTenantResource 
  → LIVE tenant-owned data snapshot 
  → certified BankingEngine executes live 
  → tenant-scoped result served through real HTTP boundary (200/403).
```

**Golden expected-outputs were NOT used as the live result** — they remain reference/SNAPSHOT only
(provenance rule §8 preserved).

---

## 5. Negative / security tests verified (server/platform boundary)

- forged / missing / malformed token → **401**
- wrong issuer / audience → **401** (verifier + adapter)
- cross-tenant resource access (A→B, B→A) → **403**
- authenticated-but-unauthorized (`viewer` executing) → **403**
- direct API access bypassing React → enforced at the **HTTP transport boundary** (401/403), not
  by frontend navigation visibility
- deny audited with user identity + tenant in `EnterpriseRuntime.auditLog`

---

## 6. Seven-gate LIVE-readiness table (updated)

| # | Criterion | Status |
|---|---|---|
| 1 | Authentication + session validation enforced (real OIDC/JWKS) | ✅ **PASS (real)** |
| 2 | RBAC via `EnterpriseRuntime` / `ApiSecurity`-style gate | ✅ **PASS (real)** |
| 3 | Tenant context platform-validated on every request | ✅ **PASS (real)** |
| 4 | Tenant isolation | ✅ **PASS (real, both directions)** |
| 5 | Request-level / security audit | ✅ **PASS (real)** |
| 6 | **Authenticated tenant-scoped live engine output** | ✅ **PASS (proven in local deployment)** |
| 7 | Golden-output provenance rule | ✅ PASS |

**All seven gates green in the local deployment.**

---

## 7. Regression gate

| Suite | Result |
|---|---|
| v1.1 / v2.0 platform certification | unchanged (no platform source touched) |
| v3.0 offline suite | **107/107 PASS** (live file auto-skips without Keycloak) |
| G3 LIVE integration | **8/8 PASS** (real Keycloak) |
| Project `tsc --noEmit` | clean |
| Production `vite build` | succeeds |
| New server/live files `tsc` | clean (with `@types/node`) |

---

## 8. Scope, limitations & honest disclosure

- **Keycloak is provisioned per-test** (ephemeral, started + torn down within the orchestrated
  run) because this environment cannot hold a long-lived daemon between calls. In the target
  local/production environment, Keycloak runs **persistently**; the adapter/verifier/executor
  wiring is identical.
- **"Live" data:** this environment has no external market-data feed, so the tenant-owned
  snapshot uses **deterministic test market-data fields**. The engine **output is computed live**
  by the certified engine (never read from golden expected-outputs). This is consistent with the
  platform's constitutional invariant: engines consume immutable data snapshots; tenant is a
  **resource-access boundary**, never an input to engine math.
- **`directAccessGrantsEnabled`** on `iips-spa` is a **dev/test convenience** for headless token
  acquisition; production flow remains **authorization-code + PKCE**.
- No self-issued JWTs, no password store in IIPS, no credentials/secrets in git.

---

## 9. Files added / changed (G3 LIVE)

- `frontend/server/live/real-oidc-verifier.ts` — **new** real JWKS RS256 verifier.
- `frontend/server/live/keycloak-provision.mjs` — **new** automated realm/client/roles/users/mappers.
- `frontend/server/live/live-tenant-engine.test.ts` — **new** live integration suite (offline-safe).
- `frontend/server/secured-executor.ts` — **changed**:
  - `authenticate`: resolve governed `userId` from `preferred_username` (fallback `sub`).
  - `authorize`: enforce RBAC for the **requested action** (previously forced `execute`), plus
    quota + resource gate, with correct allow/deny audit.
- `frontend/package.json` / `package-lock.json` — added `@types/node` (dev) for server-layer typecheck.

---

## 10. Recommendation & next step

**G3 LIVE — APPROVED (maintainer).** Criterion #6 proven in the local deployment; all seven gates
green; SNAPSHOT stays active as reference; golden provenance preserved.

**Phase 12 — Administration / Enterprise Operations** is **eligible for authorization** but
remains a **separate decision**: it requires its own explicit approval and its own scope, contract
inspection, implementation, and certification gates. The maintainer has explicitly chosen **not**
to merge the G3 approval with a Phase 12 approval.

Per the phase discipline, this report is the **final G3 milestone deliverable**. No Administration
work has been started. **Stop here — awaiting the explicit Phase 12 authorization command.**
