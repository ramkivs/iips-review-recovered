# IIPS v3.0 — G-2 — **IRR GATE B IMPLEMENTATION-AUTHORITY ACT — PREPARED FOR DECISION**

> ## STATUS: **PREPARED — NOT AUTHORIZED — NOT GRANTED — NO IMPLEMENTATION PERFORMED**
> This is a **request for one rendered decision** in the IRR repository. It grants nothing, changes
> no source, ref, route, fence, or runtime behavior, and **does not permit Gate B implementation**.
> Gate B remains **NOT GRANTED** until the Program Authority renders this act **and** the paired IPD
> act; **the 503 `owner-context-unavailable` fence stays exactly as it is until Gate D**.

| Field | Value |
|---|---|
| **Act identifier** | `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` |
| **Artifact type** | **Prepared implementation-authority act** (request for decision — not a decision) |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/075f10df-iips-review-recovered` (existing **PR #117** G-2 governance workstream; no competing PR) |
| **Authority capacity required to render** | **RAMKI — Program Authority, acting in the IRR capacity** for `ramkivs/iips-review-recovered` |
| **Paired act (required, separately owned)** | `IIPS-V3-G2-IPD-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` in `ramkivs/iips-production-market-data` — the same human may act in both capacities; each act states its own capacity and ref |
| **Governing records (IRR-side)** | DP-1 Option 1A′ identity/credential trust **amendment** — `docs/integration/IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md`, blob `c71661a1ee445b2348cedfedae4aef6449029ebb` @ IRR `main` `10584439f33dfa9192955c3f74879f20ccaf111e` |
| **Governing records (IPD-side, by reference)** | accepted `L-IPC-1` rev 2 C1–C12, blob `cab04b6f94618c9afad1440882ebf63437fdf6f8`; acceptance decision blob `f7086304…`; Gate A reconciliation blob `b1353d5b…` |
| **IRR basis state** | IRR `main` `10584439…` (PR #118 merged 2026-10-16T17:52:23Z); fence blobs `owner-context-unavailable.ts` `cb8db45d…` and `user-portfolio-transport.ts` `51704c12…` — unchanged |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, H-18 scope |

---

## 1. THE SINGLE DECISION REQUESTED

> **May Gate B implementation begin in IRR, on the basis and within the exact scope recorded below?**

The accepted order is `1 DP-1 amendment → 2 Gate A → 3 Gate B → 4 Gate C → 5 D+E`. IRR's own
amendment record (§10) names **Gate B — implementation authority (IPD + IRR acts): exact files/tests,
mechanism, C5 rules, exclusions** as the next required act after Gate A, and states that it is
**"Not granted."** This request supplies the IRR-side half of that paired act. Its scope is fixed by
the governing records — *"the endpoint, its resolver wiring, the C5/C7 rules, canonical identity
(§7.3), and the exact IPD+IRR files/tests"* — **not invented here**.

**This act authorizes implementation only.** It admits no route, enables no capability, removes no
fence, and authorizes no write, no qualification, and no production state.

---

## 2. VERIFIED BASIS AT PREPARATION (live remote, read-only)

| # | Item | Verified value |
|---|---|---|
| 1 | IRR `main` | `10584439f33dfa9192955c3f74879f20ccaf111e` (= merge commit of PR #118) |
| 2 | DP-1 amendment **effective on `main`** | blob `c71661a1ee445b2348cedfedae4aef6449029ebb`, 17,128 B — status **"AMENDED FOR ONE DEPLOYMENT — CONTRACT POSITION ONLY"**; §3 amends five clauses; §5 aligns IRR DP-1 to the accepted IPD `L-IPC-1` |
| 3 | 503 fence | `frontend/server/owner-context-unavailable.ts` `cb8db45d…`; `frontend/server/user-portfolio-transport.ts` `51704c12…` — **unchanged** |
| 4 | IRR code of record for this boundary | `frontend/server/user-portfolio/{translationBoundary,userPortfolioBoundary,userPortfolioContract,userPortfolioPort}.ts` (+ their tests, incl. `option2F.test.ts`); `frontend/server/user-portfolio-transport.ts`; `frontend/server/owner-context-resolver.ts`; `frontend/server/executive-transport.ts` |
| 5 | Gate A (IPD) | `GATE A — PROVISIONED / VALIDATED`; derivative `2ded0e98…` published at `refs/heads/gate-a/local-principal-enablement-2026-10-16` |
| 6 | Prior "Gate B"-named IRR records | four 2026-10-13 records about **reports ownership source / option C** — a **different track**; they are **not** G-2 Gate B implementation-authority drafts and are not relied on here |
| 7 | Existing IRR open workstreams | PR #117 (this record's workstream) and PR #114 — **neither is merged**; no competing PR is created |

---

## 3. IMPLEMENTATION BASIS (resolved explicitly — and the separate decision it needs)

**Finding.** IRR `main` is the authoritative IRR line and **already carries** everything the IRR side
of this boundary must extend: the claim-refusal enumerations, the owner-context resolver, the port
and boundary contracts, and the two 503 fence files. Unlike IPD, **no off-main IRR lineage is
required**, and nothing in the IRR side of Gate B needs the IPD durable store or its lineage.

**Proposed basis (the PA may amend or reject):**

| | Proposal |
|---|---|
| **Basis ref to be created** | `refs/heads/gate-b/local-principal-ipc-implementation` |
| **Starting commit** | **IRR `main` `10584439f33dfa9192955c3f74879f20ccaf111e`** — the authoritative tip that includes the DP-1 amendment |
| **Effect on existing refs** | **None.** IRR `main` is not moved or modified; no other ref is touched |
| **What this is not** | not a promotion or admission of any IPD lineage; not an IRR-side amendment; not an activation of any route or capability; not a write path |

**The separate authority decision this requires (flagged, not performed):** creating a new
implementation branch — and thereby authorizing a new IRR implementation baseline — is a distinct
authority act. It may be rendered **either** as an explicit element of this act **or** as a separate,
prior baseline act; the Program Authority chooses. **This request performs neither.**

---

## 4. PERMITTED SCOPE — EXACT FILES, MODULES, AND CHANGES (proposed; the PA may narrow)

**May be created (new files only; names are proposals):**

| Path | Purpose |
|---|---|
| `frontend/server/user-portfolio/ipcClient.ts` | same-host IPC client to the IPD-owned endpoint (Windows named pipe; POSIX socket for dev/CI): strict framing, size caps, timeouts, **no principal, owner, tenant, or portfolio-scope field ever sent** |
| `frontend/server/user-portfolio/ownerContextFromBinding.ts` | the amended DP-1 source attribution: owner context sourced from the provisioned IPC endpoint binding; the tenant hint remains a **hint**, validated by IPD, and **fails closed** |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | adapter conforming to the existing `userPortfolioPort` contract, mapping IPD refusals (including the DP-2 2F refusal) into the existing refusal vocabulary — **no mutation on refusal** |
| `frontend/server/user-portfolio/firstPartySignal.ts` | **C9** hardening helper (first-party signal + `Origin`/`Sec-Fetch-Site` consistency) — CSRF hardening only, **never recorded as authentication** |
| `frontend/server/user-portfolio/ipcClient.test.ts`, `frontend/server/user-portfolio/ownerContextFromBinding.test.ts`, `frontend/server/user-portfolio/ipcPortAdapter.test.ts`, `frontend/server/user-portfolio/fenceUnchanged.test.ts` | the Gate B IRR test set (§11) |

**Must remain byte-unchanged — and are verifiable invariants of this act:**

- `frontend/server/owner-context-unavailable.ts` (`cb8db45d…`) — **fence message**, untouched;
- `frontend/server/user-portfolio-transport.ts` (`51704c12…`) — **fence behavior**, untouched: the
  owner-scoped routes continue to answer **HTTP 503 `owner-context-unavailable`** before any domain
  or persistence access;
- `frontend/server/user-portfolio/translationBoundary.ts` (the `G2_*_CLAIM_KEYS` enumerations and
  `assertNoG2CallerAuthority` / `classifyG2Claims`) — reused **read-only**;
- `frontend/server/executive-transport.ts` (C8 posture: loopback-only, no wildcard CORS on
  owner-scoped routes) and `frontend/vite.config.ts` (`allowedHosts`) — untouched.

**Explicitly deferred to Gate D:** any change to the transport that would let a request reach the
IPC path, and therefore any change to the two fence blobs. **Gate B must not file a byte into
either fence file.**

**Prohibited within Gate B:** removing, bypassing, weakening, or shadowing the 503 fence; enabling
owner-scoped routes; changing listen host, CORS, or `allowedHosts`; adding any second store,
credential, issuer, token, service account, or browser-supplied identity; touching IPD code; any
schema, migration, or database change; any new runtime dependency; production or deployment
artifacts.

---

## 5. IPC MECHANISM AND TRUST BOUNDARY (as accepted; not re-opened)

The IRR process opens the IPD-owned same-host endpoint as an ordinary local process under the
operator's own account — no service, no elevation, no separate account, no credential. IRR
**supplies no principal, owner, tenant, or scope**: the arrival of a request on that endpoint *is*
the principal (C3), and **no peer process identity is claimed or available**. A same-account process,
including malware, is **outside** the protection boundary (disclosed, not mitigated). The browser
carries no authority and cannot open the endpoint. No TCP, HTTP, mTLS, OIDC, token exchange,
forwarded principal, or service credential is part of this path.

---

## 6. `L-IPC-1` C1–C12 — OBLIGATIONS APPLICABLE TO THIS IMPLEMENTATION (IRR side)

| Clause | IRR-side obligation |
|---|---|
| **C1** One privileged surface | IRR exposes **no** network surface for owner-scoped operations; its only path to them is the same-host IPC endpoint |
| **C2** Endpoint owned by IPD | IRR **never** creates, binds, or listens on the endpoint; it is a client only |
| **C3** One principal, no wire identity | IRR sends **no** principal, owner, tenant, membership, or portfolio-scope value, and never mints or forwards one |
| **C4** Two ordinary processes, no service, no elevation | IRR runs as the operator's ordinary process; no service install, no elevation |
| **C5.1–C5.5** Compensating design rules | the client must tolerate the no-bytes rule (no pre-request output, no banner expectation), send exactly one well-formed request per operation, apply timeouts and size caps, and fail closed if the endpoint is absent, stale, or refuses — **never** retry onto another surface or fall back |
| **C6** Fail closed, uniformly | IRR maps every refusal to the existing indistinguishable "not found"-style vocabulary; **no owner disclosure**; no partial effect |
| **C7** Refusal of caller-supplied authority | IRR **keeps** its existing refusal of the enumerated claim classes at its own boundary and renders **no** owner-context value from caller-supplied claims; IPD re-enforces the same refusal independently (IPD act §6) |
| **C8** Loopback-only posture | unchanged and preserved (§4 read-only files); no LAN/preview/reverse-proxy posture |
| **C9** Cross-site hardening (not authentication) | implemented as the helper in §4 and applied to owner-scoped state changes **without** being called authentication |
| **C10** Provisioned, opaque, one-to-one binding | IRR treats the binding as opaque and one-to-one; it creates no equivalence to any other identity domain and derives no identity from the wire |
| **C11** No parallel store | IRR introduces **no** store, cache-of-record, or side file for portfolio data |
| **C12** Canonical identity | see §7 |

---

## 7. C12 — CANONICAL IDENTITY TREATMENT (explicit)

1. IRR **never** supplies or forwards `companyId`, `runtimeCompanyId`, `identityStatus`,
   `resolutionDisposition`, symbol/ISIN/exchange-shaped identity, or any caller-controlled identity
   value on this path — and **refuses** requests that carry them (existing `translationBoundary`
   enumerations, preserved read-only).
2. **IPD performs the canonical resolution or refusal**; IRR does not manufacture, default, or
   "repair" an identity, and does not convert a refusal into a success.
3. Zero (`UNMAPPED_IDENTIFIER`) or conflicting (`AMBIGUOUS_COLLISION`) resolution ⇒ the operation is
   **refused**, with **no mutation, no revision, no holding row, and no success response**.
4. **No bypass**: `NON_PRODUCTION_OPERATOR_BYPASS` and any false canonical-provenance declaration are
   **not** emitted, ported, or admitted on this path.
5. **No successful write is authorized by this act**; the write policy is Gate E's, and until then
   the adapter must surface refusal, not an optimistic result — and must never claim durability for a
   session-scoped or in-memory result.

---

## 8. REFUSAL, FAIL-CLOSED, AND PROHIBITED BYPASSES

Required: fail closed when the endpoint is absent/refusing/stale (no fallback, no retry onto another
surface); no bytes emitted or consumed before a valid request; no owner-existence disclosure; no
partial effect; refusal of caller-supplied authority and of unresolved/ambiguous identity; refusal
mapping that is indistinguishable for "absent" and "unauthorized". **Prohibited:** any bypass
(multi-user, hosted-preview, wildcard CORS, debug flag, "temporary" un-fencing); any credential
injection; any fabricated owner/tenant/portfolio scope; representing a refusal or a session-scoped
outcome as a durable save.

---

## 9. CONTROLS PRESERVED BY THIS ACT (unchanged, in force)

**IRR HTTP 503 `owner-context-unavailable` fence — in force and byte-unchanged until Gate D**;
**DP-2 Option 2F** — unresolved/ambiguous holdings refused for persistence, before serialization,
port call, or persistence; **C11** single store (IPD's); **H-18** one user / one personal laptop /
non-production; **all four Gate V PA waivers remain accepted and are not reopened** (V-1 ACL/SDDL,
V-4 pipe collision/re-bind, second-account access, remote-machine access — waivers, not technical
proof).

---

## 10. EXPLICIT EXCLUSIONS — NOT AUTHORIZED BY THIS ACT

Gate C qualification; **Gate D** route/consumer admission (including the fence change and any
activation of the owner-scoped routes); Gate E write policy / canonical-identity source designation /
successful writes; **P-6** and **P-8**; provisioning or credentials of any kind; production,
deployment, or "ready" claims; removing or relaxing the fence, DP-2 2F, C11, or H-18; any change to
IPD source or to the IPD store; merging PR #8 / PR #117 / PR #114 or any IRR PR; any promotion,
merge, cherry-pick, re-pin, or admission of any IPD lineage; OIDC, Keycloak, RBAC, multi-user or
enterprise tenancy; a second store; a Windows service or separate service account.

---

## 11. REQUIRED TESTS AND EVIDENCE — GATE B **vs** GATE C (kept strictly separate)

**Gate B (implementation) requires:** the §4 test files passing on the designated basis, covering —
IPC client framing/timeouts/caps and correct failure on absent/stale/refusing endpoints; the client
sends **no** identity/scope field (asserted on the wire form); owner-context-from-binding behavior
including the fail-closed tenant hint; adapter refusal mapping with **no mutation on refusal**;
C9 helper behavior; and a **fence-unchanged regression test proving the owner-scoped route still
answers HTTP 503 `owner-context-unavailable` and that both fence blobs are byte-identical to
`cb8db45d…` / `51704c12…`**. Plus the published implementation diff and commit identities.
**Gate B evidence is not qualification evidence.**

**Gate C (qualification) — deferred, and nothing here may claim it:** the §10 / Q1–Q11 items on the
realized endpoint, including **C5.1/Q9 zero-bytes probe (mandatory, and NOT claimed as passed)**,
C5.3/C6 startup fail-closed, the refusal matrix on the realized endpoint, owner/tenant isolation,
revision/lifecycle, durability across restart, exactly-one-store, drift check — plus the Gate V
measurements on the deployment host (where a V-E item would repeat one of the four waived
measurements, **the waiver governs**).

---

## 12. STOP CONDITIONS, ROLLBACK, AND FAIL-CLOSED EXPECTATIONS

**Stop before any mutation if:** IRR `main` is no longer `10584439…`; either fence blob differs from
`cb8db45d…` / `51704c12…`; the proposed basis ref exists with a different tip; the paired IPD act is
not rendered (the two acts are interdependent); or any required behavior cannot be implemented inside
§4 (scope expansion ⇒ stop and report, never improvise). **Rollback:** revert the IRR implementation
commits on the Gate B basis ref; nothing else is touched — **no fence, route, or runtime behavior is
altered by design**, so no rollback of behavior exists. **Fail-closed:** absent/refusing endpoint ⇒
the operation fails closed; refusal mapping must never disclose owner existence.

---

## 13. WHAT THIS REQUEST DOES NOT DO

It **renders no authority**; performs **no implementation**; creates **no ref, file, or commit in any
source tree**; **moves no ref** (IRR `main` untouched); **does not touch the fence files, routes,
runtime behavior, or IPD**; **does not merge** any PR and **does not open a competing PR**; **grants
no** Gate C/D/E, P-6, P-8, route admission, write policy, or production status; **does not reopen**
any waived Gate V test.

---

## 14. EXACT PROPOSED DECISION TEXT (for the Program Authority to render)

> **IRR Gate B — implementation authority.** On the verified basis (IRR `main` `10584439…` with the
> DP-1 amendment effective; the 503 fence byte-unchanged), and subject to the paired IPD act
> `IIPS-V3-G2-IPD-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` being rendered, I authorize Gate B
> implementation in `ramkivs/iips-review-recovered` **within the exact scope of §4** and under the
> obligations of §5–§9: the same-host IPC client, the owner-context-from-binding path, the port
> adapter and refusal mapping, and the C9 hardening helper — on the implementation basis **[the PA
> designates: either (i) `refs/heads/gate-b/local-principal-ipc-implementation` created at
> `10584439f33dfa9192955c3f74879f20ccaf111e`, or (ii) another basis the PA names]**, with the
> baseline-creation decision rendered **[as an element of this act | as a separate prior act]**.
> **The two 503 fence files remain byte-unchanged and the owner-scoped routes continue to answer
> HTTP 503 `owner-context-unavailable` until a separate Gate D admission act**; **no** route is
> admitted, **no** write is enabled, **no** credential or issuer is introduced, and **no**
> production state is claimed. DP-2 Option 2F, C11, H-18, and all four Gate V waivers remain in force
> and un-reopened. **Disposition:** `APPROVE` / `APPROVE WITH CHANGES` / `REJECT` / `DEFER`.

**Required confirmations if not `REJECT`/`DEFER`:** (i) the implementation basis (and who creates the
ref); (ii) the exact permitted file set (§4) and any narrowing; (iii) that the fence files stay
byte-unchanged until Gate D; (iv) that Gate C remains separate and C5.1/Q9 is not claimed; (v) that
the paired IPD act is rendered.

---

## 15. PUBLICATION OF THIS REQUEST

Published additively in the **existing IRR G-2 governance workstream (PR #117)** — one added
governance artifact; **no competing PR**, no implementation file, no source change, no route or
fence change, no ref created or moved, and no merge of any PR.

*End of prepared act `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` —
**PREPARED · NOT AUTHORIZED · GATE B NOT GRANTED · 503 FENCE UNCHANGED · NON_PRODUCTION**.*
