# Program v3.0 — G3 Build: Authentication Authority — HARD STOP

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 Build + Certification (Enterprise Identity & Tenant Boundary)
**Document type:** HARD STOP — architectural review required (no authentication authority defined)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** **STOPPED — authentication authority is undefined. No G3 auth implementation.**

---

## 1. The finding (first action — inspect before implementing)

An exhaustive repository search for an existing identity/authentication boundary returned **no approved mechanism**:

| Sought | Found |
|---|---|
| Identity provider (Keycloak/Cognito/Auth0/Okta/IdP) | ❌ None |
| OAuth / OIDC boundary | ❌ None |
| SAML / enterprise SSO integration | ❌ None |
| Session service / token validation | ❌ None |
| Gateway / reverse-proxy auth | ❌ None |
| Custom login / credential store | ❌ None (and MUST NOT be invented) |

The only matches were the G3 documentation itself and a transitive `package-lock.json` entry — **no actual authentication surface**.

## 2. HARD STOP triggered

Per the G3 Build authorization:

> *"If an approved authentication mechanism does not exist, document the missing external identity boundary and propose the minimum contract required. STOP for architectural review if the authentication authority itself is undefined."*

The **authentication authority is undefined**. Therefore:

- **No custom username/password authentication is implemented.**
- **No ad-hoc JWT + localStorage token mechanism is implemented.**
- **No session service is invented.**
- **Live tenant data remains blocked.**
- **Reference SNAPSHOT remains the active safe experience.**
- **Phase 12 (Administration / Enterprise Operations) remains NOT authorized.**

## 3. Why this is the correct boundary

The G3 milestone is a **security boundary**, not a UI feature. Inventing an authentication mechanism purely to "connect the UI" would:

1. Duplicate security primitives that must come from an approved identity authority.
2. Create an ungoverned credential/session surface (security risk).
3. Risk the certified v2.0 platform being reached through an unvetted boundary.
4. Violate the v2.0/v1.1 governance model.

## 4. Proposed minimum authentication contract (for architectural review)

The G3 boundary should be defined as a **mechanism-agnostic contract** that an **approved identity provider adapter** will implement — NOT a custom mechanism. The minimum contract:

```ts
// Proposed G3 authentication boundary contract (mechanism-agnostic).
// To be implemented ONLY against an approved identity authority.
interface SessionValidator {
  // Validates an opaque session credential from an approved IdP; returns a governed Principal.
  validate(credential: unknown): Promise<AuthenticatedPrincipal>;
  // Revocation/logout where the IdP supports it.
  revoke(sessionId: string): Promise<void>;
}

interface AuthenticatedPrincipal {
  readonly userId: string;   // from the IdP, NOT client-supplied
  readonly tenantId: string; // validated against the IdP/principal
  readonly roles: string[];  // from the approved role source
  readonly expiry: number;
}
```

This is the **contract only** — it does not bind to any concrete mechanism until an identity authority is approved.

## 5. What must be decided before G3 can proceed (architectural review)

1. **Which approved identity provider / authentication boundary will be used?** (OIDC-compatible IdP, enterprise SSO, etc.)
2. Where does the session/token validation occur (gateway, reverse proxy, platform service)?
3. How is `tenantId`/`roles` sourced and validated (IdP claims vs platform directory)?
4. What is the credential transport (authorization header, cookie, etc.) — determined by the approved mechanism.

Until these are decided by the maintainer, **G3 authentication cannot be built safely**.

## 6. What HAS been established (reusable, no auth needed)

The v2.0 security primitives to be wired against the approved boundary are confirmed and reusable:
- `EnterpriseRuntime.Principal`, `Role`, `authorize()`, `check()`, `authorizeExecution()`, `isTenantResource()`, `AuditRecord`, `auditLog()`
- `PlatformApi.ApiSecurity.authorize()`

These are the authoritative authorization surface that G3 will wire to once an authentication authority is approved.

## 7. Recommended next action (awaiting maintainer decision)

**STOP.** Present the missing authentication authority to the maintainer for architectural review. Options:
- **A.** Authorize a specific external identity provider (OIDC/SSO) as the authentication authority.
- **B.** If the platform must self-authenticate, explicitly authorize a governed authentication design (with credentials handling, secure storage, rotation, MFA) as a separate, reviewed security decision — NOT an ad-hoc JWT+localStorage shortcut.
- **C.** Defer G3 auth until an IdP boundary exists; keep reference SNAPSHOT active.

## Status

**G3 BUILD — HARD STOP (authentication authority undefined).** Awaiting architectural decision before any G3 authentication implementation. Live tenant data and Phase 12 remain blocked.
