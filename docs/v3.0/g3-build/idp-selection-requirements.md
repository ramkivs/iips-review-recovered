# Program v3.0 — G3: IdP Selection Requirements

**Program:** IIPS Engineering Standards — Program v3.0
**Milestone:** G3 — Identity Provider Selection Requirements (vendor-open)
**Document type:** REQUIREMENTS (no vendor chosen)
**Version:** 1.0
**Date:** 2026-08-09
**Status:** REQUIREMENTS — an eventual IdP must satisfy these. No vendor is selected.

> The identity authority must satisfy the **IIPS security boundary**. It is NOT chosen based on ease of React integration.

---

## 1. Required capabilities

An eventual identity provider / SSO boundary must support, as applicable:

| # | Capability | Required |
|---|---|---|
| 1 | OpenID Connect (OIDC) | ✅ |
| 2 | Secure authentication (no plaintext credentials in IIPS) | ✅ |
| 3 | Enterprise SSO | ✅ |
| 4 | Token / session validation | ✅ |
| 5 | Expiry | ✅ |
| 6 | Revocation / logout semantics | ✅ |
| 7 | MFA capability | ✅ |
| 8 | Group / role claims or equivalent directory integration | ✅ |
| 9 | Tenant / organization identity | ✅ |
| 10 | Secure key / signature rotation | ✅ |
| 11 | Auditability | ✅ |
| 12 | HTTPS / TLS | ✅ |
| 13 | Appropriate enterprise security controls | ✅ |

## 2. Integration posture (vendor-neutral)

- IIPS integrates via the **IdP-neutral `SessionValidator` adapter**; swapping the IdP must not change the application Principal/authorization surface.
- IIPS never stores passwords or issues its own tokens.
- The IdP establishes authenticated identity; IIPS establishes + validates tenant/RBAC.

## 3. Selection criteria (do not optimize for React ease)

The identity authority must be selected on:
- Enterprise SSO + OIDC conformance.
- MFA, revocation, logout, expiry support.
- Group/role claim mapping to governed roles.
- Tenant/organization identity.
- Key/signature rotation.
- Auditability + enterprise security controls.
- Deployment fit (self-hosted vs managed) — a separate deployment decision.

## 4. Examples are possibilities, not approvals

Okta, Microsoft Entra ID, Keycloak, Auth0, Amazon Cognito, etc. are **candidate examples only**. **None is currently approved.**

## 5. No implementation until selection

- No authentication library installed (Keycloak/Auth0/Entra/Passport/NextAuth/etc.).
- No credentials/login/token/session implementation.
- Reference **SNAPSHOT** remains active.
- Live tenant data and Phase 12 (Administration) remain blocked.

## 6. Decision needed

**Which external identity authority will IIPS use?** Once selected, a separate implementation authorization is required against that specific IdP.

## Status

**IDP SELECTION REQUIREMENTS — COMPLETE.** Awaiting maintainer decision on the identity authority.
