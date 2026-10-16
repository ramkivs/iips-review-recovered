# IIPS v3.0 — G-2 — IRR DP-1 IDENTITY/CREDENTIAL TRUST AMENDMENT

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-G2-IRR-DP1-IDENTITY-CREDENTIAL-TRUST-AMENDMENT-2026-10-16-01` |
| **Record type** | **IRR-side durable authority decision record / dated addendum** — amends the DP-1 Option 1A′ identity/credential trust clauses for the durable user-portfolio capability. Preserves the prior DP-1 record unchanged as historical authority; this record is additive. |
| **Decision authority** | **Ramki — Program Authority**, acting in the IRR capacity for `ramkivs/iips-review-recovered` and, for the IPD-owned portfolio domain, as the IPD security-contract authority |
| **Decision date** | **2026-10-16** (Asia/Calcutta) |
| **Recording agent** | Arena Agent Mode — recording and publication only; no authority is rendered or inferred by the agent |
| **Authoritative repository / ref (IRR)** | `ramkivs/iips-review-recovered` / branch `arena/8aff8266-iips-review-recovered` (this record's publication branch); verified starting commit `eb4bf820c62eb3e2f5c628a95d59c8f967e3f629` (IRR `main` at the time of this record) |
| **Related IPD decision** | `ramkivs/iips-production-market-data` — commit `66be69518eb3b66b3edac88a64363ca85f99688f` (PR #8, **OPEN, NOT MERGED**) — `evidence/np04/IIPS_v3.0_G2_IPD_SECURITY_CONTRACT_ACCEPTANCE_DECISION_2026-10-16.md` (Record ID `IIPS-V3-G2-IPD-SECURITY-CONTRACT-ACCEPTANCE-DECISION-2026-10-16-01`) |
| **Subject IPD contract** | `IIPS-V3-G2-IPD-LOCAL-PRINCIPAL-OS-IPC-SECURITY-CONTRACT-PROPOSAL-2026-10-16-01` — revision 2, clauses C1–C12; accepted text = revision-2 file at blob `cab04b6f94618c9afad1440882ebf63437fdf6f8` |
| **Amended IRR record** | `docs/integration/IIPS_v3.0_GATE_C_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md` (Record ID `IIPS-V3-REG12-GATE-C-S5A-DP1-1AP-BINDING-CONTRACT-AND-PREREQUISITE-SPECIFICATION-2026-10-13-01`) — **preserved as historical authority; not rewritten** |
| **Status** | **AMENDED FOR ONE DEPLOYMENT — CONTRACT POSITION ONLY.** No provisioning, implementation, qualification, admission, write, or promotion authority is granted by this record. |

---

## 1. Purpose

This is the separate IRR-side authority act required by the accepted IPD security-contract decision. It records, durably and explicitly, that the DP-1 Option 1A′ identity/credential trust position is amended for this one-user, one-personal-laptop, non-production deployment to align with the accepted IPD-owned, single-principal, same-host IPC boundary.

It does **not** treat the IPD decision as having amended IRR automatically. The IPD decision accepted the contract with changes; this record is the distinct IRR-side act that amends the IRR DP-1 clauses, under IRR authority, for IRR's side of the boundary.

It creates no issuer, key material, credential, configuration, `application_user`, mapping, tenant, membership, provisioning event, database write, IPD write, implementation change, successful save, or admission. It changes no application code, test, pin, lockfile, schema, route, UI, fence, transport, or runtime configuration.

---

## 2. Verified state before this act

### 2.1 IRR

- Repository `ramkivs/iips-review-recovered`, branch `arena/8aff8266-iips-review-recovered`, starting commit `eb4bf820c62eb3e2f5c628a95d59c8f967e3f629` (IRR `main`).
- DP-1 Option 1A′ record verified present at `docs/integration/IIPS_v3.0_GATE_C_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md`.
- H-18 product-scope record verified present at `docs/integration/IIPS_v3.0_H18_PRODUCT_SCOPE_SINGLE_USER_PERSONAL_USE.md`.
- No prior IRR DP-1 identity/credential-trust amendment or contradictory later decision was found in the repository or in its PR history.
- Adjacent open workstream: PR #117 (`docs: reconcile preview status and request G-2 security decision`, branch `arena/075f10df-iips-review-recovered`, **OPEN, NOT MERGED**) carries the G-2 single-user local-principal security-contract decision request and its attributed Program Authority response. It is a decision *request* and design-direction record; it is **not** this amendment and is not merged.

### 2.2 IPD (verified read-only; not modified)

- IPD security-contract acceptance decision commit `66be69518eb3b66b3edac88a64363ca85f99688f` verified on the remote; record `evidence/np04/IIPS_v3.0_G2_IPD_SECURITY_CONTRACT_ACCEPTANCE_DECISION_2026-10-16.md` read back from the remote artifact.
- Decision: **ACCEPT WITH CHANGES** — single-user, single-personal-laptop, non-production, IPD-owned same-host IPC security-contract architecture, subject to five change groups.
- Accepted proposal: `IIPS-V3-G2-IPD-LOCAL-PRINCIPAL-OS-IPC-SECURITY-CONTRACT-PROPOSAL-2026-10-16-01`, revision 2, clauses C1–C12; accepted text at blob `cab04b6f94618c9afad1440882ebf63437fdf6f8`.
- IPD PR #8 remains **OPEN and NOT MERGED**. No IPD ref, branch, tag, file, package, or record was modified by this IRR act.

---

## 3. DP-1 clauses amended

The amendment is **narrow and clause-specific**. It amends the DP-1 Option 1A′ identity/credential trust position recorded in the DP-1 specification, insofar as that position presupposes an IPD-verified OIDC bearer presented at the TCP HTTP boundary. The amended clauses are:

| DP-1 clause (as rendered 2026-10-13) | What is amended |
|---|---|
| **§2.1 / §2.2 — the `GC-D3` DP-1 act and its authorized direction** | The credential position under the act is amended from a caller-presented, IPD-verified OIDC bearer at the TCP HTTP boundary to the accepted IPD-owned, single-principal, same-host IPC endpoint. The act's other authorizations and withholdings are unchanged. |
| **§5 — P-2 trust-anchor / issuer governance and configuration requirements** | The OIDC-issuer/JWKS/audience trust-anchor requirements are amended in *position* only: for this deployment the trust source is the provisioned IPD-owned IPC endpoint binding, not an OIDC issuer. The P-2 act itself remains unrendered; no issuer, key, JWKS, or configuration is created. |
| **§5.3 — the user-delegation semantics gap** | Amended to record that the accepted IPD contract makes the IPC endpoint the credential position for this deployment. The self-asserted, single-user, non-production labeling and the prohibition on generalisation are retained and remain binding. |
| **§6 — P-3 credential acquisition and presentation path** | Amended in position: the credential is no longer a caller-presented OIDC bearer at the TCP HTTP boundary; it is accepted on the IPD-owned, single-principal, same-host IPC endpoint, with identity taken from the provisioned binding. The P-3 legitimacy conditions (no forwarded-principal trust, no browser shortcut, no static/service credential, no caller-controlled content, presentation integrity) remain in force. |
| **§6.4 — the IRR-side owner context (`G2Scope` / tenant hint)** | Unchanged in mechanism; amended in source attribution only: the governed, non-caller-controlled source is now the provisioned IPC endpoint binding rather than an OIDC-derived `(issuer, subject)`. The hint remains a hint, validated by IPD, and fails closed. |

Clauses **not** amended by this record: the `D-2` §8 fifteen-element translation contract (§4 of the DP-1 record), the provisioning requirements (§7), the implementation-authority boundary (§8), the qualification matrices (§9), the prerequisite status table (§10), and the invariant list (§11) — except where a clause above is expressly amended. Historical text of the DP-1 record is preserved; nothing is silently rewritten.

### 3.1 Before / after (verbatim positions)

```text
CURRENT (DP-1 Option 1A′ as rendered 2026-10-13):
  Credential position = a caller-presented, IPD-verified OIDC bearer at the TCP HTTP boundary.
  Identity  = issuer+subject → applicationUserId.   Tenant = ACTIVE membership required.

AMENDED (this record, ONE deployment, ONE principal):
  Credential position = "Accepted on the IPD-owned, single-principal, same-host IPC endpoint."
  Identity  = the endpoint's provisioned binding; never a wire field.
  Tenant    = ACTIVE membership required — UNCHANGED, exactly one row.
```

### 3.2 IPD-side additions acknowledged (not implemented by this record)

The accepted IPD contract carries two narrow additions. This IRR record acknowledges them as part of the aligned contract; it implements neither:

| Ref | Content | Status in IRR |
|---|---|---|
| **A-2** | Additive `local_principal_bindings` record + migration: `(endpoint_id, application_user_id → application_users, tenant_id, state ∈ {ACTIVE, REVOKED}, created_at, updated_at, revoked_at)` | **Acknowledged; not implemented.** Requires a separate IPD-side provisioning act. |
| **A-3** | Local audit line on binding and membership lifecycle mutations — local only; no cross-system audit destination created or implied | **Acknowledged; not implemented.** |

---

## 4. Scope of the amendment

- **Deployment scope:** one operator, one personal laptop, one OS account, non-production. Production remains out of scope.
- **Trust boundary:** the IPD-owned, single-principal, same-host IPC endpoint. Identity derives from the provisioned endpoint binding only.
- **No caller-supplied authority:** no caller-supplied principal, owner, tenant, or portfolio-scope value may establish identity. Caller-supplied authority is refused, not ignored (IPD clause C7).
- **No generalisation:** this is not an enterprise identity integration, a multi-user delegation model, a production trust path, or evidence of readiness for either. It does not generalise to a second user, a second tenant, or a service principal.
- **Label preserved downstream:** every artifact downstream of this record must carry the label **non-production, single-user, self-asserted delegation** (or, where the accepted IPD contract's IPC boundary applies, **non-production, single-principal, same-host IPC**), and must not claim runtime, deployment, or production readiness from any offline or scoped result.

---

## 5. Relationship to the accepted IPD L-IPC-1 contract

- IPD owns the portfolio domain and enforces the changed trust boundary. IRR consumes it; IRR does not own, implement, or qualify it.
- The IRR DP-1 position is hereby aligned to the accepted IPD contract's amended identity-acquisition clause: credential position = **"Accepted on the IPD-owned, single-principal, same-host IPC endpoint."**; identity from the provisioned binding; never a wire field.
- The IPD contract's clauses C1–C12 otherwise stand as accepted; DP-2 Option 2F remains in force; the IRR HTTP `503 owner-context-unavailable` fence remains in force.
- This record is the **IRR-side** act. The IPD-side act is `IIPS-V3-G2-IPD-SECURITY-CONTRACT-ACCEPTANCE-DECISION-2026-10-16-01` at commit `66be6951`. Neither act amends the other automatically; each is recorded in its own repository under its own authority.
- IPD PR #8 remains unmerged; the G24 off-main lineage (`6828155e`) remains unadmitted.

---

## 6. Boundaries preserved unchanged

The following are expressly preserved and are **not** amended, weakened, or reinterpreted by this record:

1. **DP-2 Option 2F** — unresolved or ambiguous holdings may be previewed and explained and **must be refused** for persistence. No bypass.
2. **H-18 scope** — single-user, personal-use application. No authentication, RBAC, multi-user support, PostgreSQL, or enterprise deployment architecture is introduced by this record. Existing auth code, OIDC/Keycloak configuration, session/principal contracts, tenant/role behaviour, transports, middleware, and authorization checks are not modified.
3. **HTTP 503 `owner-context-unavailable` fence** — `/api/user-portfolios*` remains fail-closed at source level. No route admission or fence removal is authorized.
4. **Existing fail-closed behaviour** — absent, blank, malformed, or unknown owner context denies before any port call; no default and no substitution.
5. **`applicationUserId` and tenant-authorization semantics** — the `applicationUserId` model, the external-identity mapping table and lifecycle, `resolveTenant`, the requirement for exactly one `ACTIVE` tenant-membership row, the `(applicationUserId, tenantId, portfolioId)` authorization triple, "unauthorized ≡ missing", revision/optimistic-concurrency checks, tombstone behaviour, consolidation guards, and canonical-identity validation remain unchanged.
6. **Separate authority gates** — provisioning, implementation, qualification, route admission, and writes remain distinct acts, each requiring its own explicit authority.
7. **Canonical company-identity validation** — independent of principal binding; no ticker, ISIN, FIGI, symbol, or client field becomes canonical by inference.
8. **Durable-store boundary** — IPD owns the portfolio domain and extends its store; no parallel IRR portfolio store is created or authorized.

---

## 7. Explicitly NOT authorized by this amendment

This amendment alone does **not** authorize:

- provisioning or tenant administration;
- endpoint implementation;
- P-6 implementation authority;
- P-8 qualification;
- route admission or removal of the 503 fence;
- durable integration or portfolio writes;
- a successful portfolio-save claim;
- promotion, merging, cherry-picking, or re-pinning of the unadmitted G24 off-main lineage (`6828155e`);
- merging IPD PR #8 or any IRR PR;
- any change to application code, tests, pins, lockfiles, schemas, routes, UI, fences, transports, or runtime configuration.

The IPD decision's four PA-waived V-P tests remain waived and are **not** reopened by this record, and the waivers are **not** presented as technical proof. They are:

| # | Measurement | Disposition (preserved verbatim) |
|---|---|---|
| 1 | V-1 ACL/SDDL capture | **NOT REQUIRED — PA-WAIVED** |
| 2 | V-4 pipe collision and re-bind testing | **NOT REQUIRED — PA-WAIVED** |
| 3 | Second-account access test | **NOT REQUIRED — PA-WAIVED** |
| 4 | Remote-machine access test | **NOT REQUIRED — PA-WAIVED** |

These are waivers, not technical proof. The effective ACL/SDDL, cross-account isolation, remote isolation, and lifecycle fail-closed behaviour remain technically unverified. Production endpoint qualification remains a separate future gate (IPD §6 V-E items) and is not satisfied by this record.

---

## 8. Validation performed and not performed

### 8.1 Performed (read-only)

- Verified the IRR repository, branch, and starting commit.
- Verified the DP-1 Option 1A′ record and its identity/credential trust clauses.
- Verified H-18 product scope.
- Verified the IPD acceptance decision and the accepted proposal against the IPD remote (commit `66be6951`), without modifying IPD.
- Verified that no prior IRR amendment or contradictory later decision exists for this act.
- Verified that IPD PR #8 and IRR PR #117 remain open and unmerged.

### 8.2 Not performed (and none authorized)

- No provisioning, implementation, qualification, admission, write, or promotion act.
- No IPD modification.
- No application code, test, pin, lockfile, schema, route, UI, fence, transport, or runtime configuration change.
- No successful portfolio save or route activation.
- No merge of any PR.

---

## 9. Publication and verification

- Publication vehicle: this durable record, committed to branch `arena/8aff8266-iips-review-recovered` and published via a pull request to `refs/heads/main` of `ramkivs/iips-review-recovered`. No competing PR is created; the record is additive to the existing G-2 workstream (PR #117 remains the adjacent decision-request workstream and is not duplicated).
- Merge: **not performed**. No merge authority is present in this act.
- The ChatGPT Library tracker is **not** modified by this record.

---

## 10. Next genuinely required authority act

Per the accepted IPD decision §8, the next required act after this IRR DP-1 amendment is:

1. **Gate A — local provisioning** (IPD side, separate provisioning act): one `application_user`, one opaque tenant, exactly one `ACTIVE` membership, the principal binding A-2, revocation, and the A-3 audit line. **Not authorized by this record.**
2. **Gate B — implementation authority** (IPD + IRR acts): exact files/tests, mechanism, C5 rules, exclusions; the IPD-`main` durable basis does not exist and the off-main lineage must not be promoted. **Not granted.**
3. **Gate C — qualification** (§10/Q1–Q11 including the V-E items). **Not granted.**
4. **Gate D — route/consumer admission** (503 fence stays until then) and **Gate E — write policy / canonical-identity source**. **Not granted.**

---

*Recording agent: Arena Agent Mode — recording the Program Authority's IRR-side DP-1 identity/credential trust amendment and publishing it; no authority is rendered or inferred by the agent. The amendment is additive; the prior DP-1 record and all historical records are preserved. Contract acceptance is not implementation authority; nothing here provisions, implements, qualifies, admits, writes, or merges anything.*
