# Program v3.0 — G3: Keycloak Configuration

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Keycloak local deployment config
**Document type:** CONFIGURATION
**Version:** 1.0
**Date:** 2026-08-09

> Local/self-hosted Keycloak realm + client for the IIPS local environment. Development config; production config requires HTTPS/TLS + controlled secrets.

---

## 1. Realm

- **Realm:** `iips`
- Purpose: the IIPS identity domain. Realm identity is **not** an IIPS application tenant (tenant remains platform-governed).

## 2. OIDC SPA client

| Property | Value |
|---|---|
| Client type | public (SPA), OpenID Connect |
| Flow | Authorization-code + PKCE |
| Root URL | `http://localhost:5173` |
| Valid redirect URIs | `http://localhost:5173` (explicit; no wildcard production redirects) |
| Valid post-logout redirect URIs | `http://localhost:5173` |
| Web origins | `http://localhost:5173` |

## 3. Roles

Create realm roles mapped to the governed IIPS roles:

| Keycloak role | IIPS governed role |
|---|---|
| `iips-admin` | `admin` |
| `iips-analyst` | `analyst` |
| `iips-viewer` | `viewer` |

Keycloak role membership is **not** the final authorization decision — `EnterpriseRuntime.authorize()` / `PlatformApi.ApiSecurity.authorize()` remain authoritative.

## 4. Test identities (development only)

| Username | Role | Tenant |
|---|---|---|
| `admin-a` | `iips-admin` | tenant-A |
| `analyst-a` | `iips-analyst` | tenant-A |
| `viewer-a` | `iips-viewer` | tenant-A |
| `analyst-b` | `iips-analyst` | tenant-B |

- Development/test identities only. **No real credentials.**
- Secrets are environment-controlled bootstrap; **never committed to Git.**

## 5. Environment variables (IIPS side, not committed)

```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=iips
KEYCLOAK_CLIENT_ID=iips-spa
KEYCLOAK_PUBLIC_KEY=<from realm signing key>   # via OIDC discovery in production
```

Token/signing-key metadata is read from **OIDC discovery** (`/.well-known/openid-configuration` + JWKS) — never hard-coded or invented.

## 6. Tenant/role claim mapping

- Keycloak may carry candidate organization/group claims; IIPS **validates** authoritative tenant context (see `principal-tenant-mapping.md`).
- Do not blindly trust a `tenantId` from browser/URL/localStorage/unvalidated header.

## 7. Status

**KEYCLOAK CONFIGURATION — DOCUMENTED.** Local deployment config; secrets env-controlled; production config requires HTTPS/TLS + controlled secrets.
