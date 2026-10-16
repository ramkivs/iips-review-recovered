# IIPS v3.0 — G-2 — **IRR GATE B IMPLEMENTATION-AUTHORITY — DECISION RECORD — PENDING AUTHORITY REVIEW**

> # ⛔ STATUS: **PENDING AUTHORITY REVIEW — NOT APPROVED — NOT A DECISION — GATE B NOT GRANTED**
>
> **This artifact is the IRR-side decision record paired with the IPD decision record on IPD
> PR #8. It contains no rendered approval, no approver name, no signature, and no implied
> consent. Every disposition field below reads `PENDING AUTHORITY REVIEW`. Approval is not
> inferred** from the existence of the IRR Gate B request, from the effective DP-1 amendment,
> from the instruction to prepare this record, from the paired IPD decision draft's existence
> or publication, or from any other artifact. **No decision exists until the Program Authority
> renders one under its own authority, in its own words, recorded by a subsequent additive
> artifact.** The paired IPD decision record is itself still **`PENDING AUTHORITY REVIEW` —
> NOT APPROVED**; nothing in this record treats it as approved, and this record remains
> independently reviewable.
>
> **Gate B implementation remains BLOCKED until that act is rendered — in both repositories.**
> No `gate-b/*` ref exists or may be created; no implementation file may be authored, changed,
> or committed. **The IRR HTTP 503 `owner-context-unavailable` fence stays exactly as it is
> until a separately authorized Gate D act.**

| Field | Value |
|---|---|
| **Record identifier** | `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-DECISION-RECORD-2026-10-16-01` |
| **Record type** | **Decision record — prepared for review** (recording only; renders nothing) |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/075f10df-iips-review-recovered` (existing **PR #117** G-2 governance workstream; no competing PR) |
| **Authority required to render** | **RAMKI — Program Authority**, acting in the **IRR capacity** for `ramkivs/iips-review-recovered` |
| **Decision status** | **`PENDING AUTHORITY REVIEW`** |
| **Decision requested (source)** | IRR Gate B implementation-authority request `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` — `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-16.md`, blob `3e88ebecf702f70a5c60d5ea105e916e3af99acd` at PR #117 head `7fcb7ba15d0dc2708e4570b526e83e0049368dd0` |
| **Paired IPD decision (separately owned, not approved)** | `IIPS-V3-G2-IPD-GATE-B-IMPLEMENTATION-AUTHORITY-DECISION-RECORD-2026-10-16-01` — `evidence/np04/IIPS_v3.0_G2_IPD_GATE_B_IMPLEMENTATION_AUTHORITY_DECISION_RECORD_2026-10-16.md` @ `ramkivs/iips-production-market-data` PR #8 head `6a95a3294f0e2b7c3edaaa41c92a904b90d34792` (branch `arena/21c63aef-iips-production-market-data`, **OPEN, NOT MERGED**) — status **`PENDING AUTHORITY REVIEW`** |
| **Governing records (IRR-side)** | Effective DP-1 amendment — `docs/integration/IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md`, blob `c71661a1ee445b2348cedfedae4aef6449029ebb` @ IRR `main` `10584439f33dfa9192955c3f74879f20ccaf111e` (effective via merged PR #118); DP-1 Option 1A′ specification `docs/integration/IIPS_v3.0_GATE_C_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md` (preserved as historical authority); H-18 product-scope record |
| **Governing records (IPD-side, by reference)** | accepted `L-IPC-1` rev 2, clauses C1–C12, blob `cab04b6f94618c9afad1440882ebf63437fdf6f8`; IPD security-contract acceptance decision `IIPS-V3-G2-IPD-SECURITY-CONTRACT-ACCEPTANCE-DECISION-2026-10-16-01` @ IPD commit `66be69518eb3b66b3edac88a64363ca85f99688f` (IPD PR #8, **OPEN, NOT MERGED**) |
| **IRR basis state** | IRR `main` `10584439f33dfa9192955c3f74879f20ccaf111e` (merge commit of PR #118, 2026-10-16T23:22:23+05:30; tree `df7e754618cb7b0500966d8fdf84c5598f4b2b24`); fence blobs `owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` and `user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f` — **unchanged**; `gate-b/*` refs on the IRR remote = **0** |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, H-18 scope |
| **Prepared at (UTC / local)** | 2026-10-16 / 2026-10-16, Asia/Calcutta |

---

## 1. DECISION ARCHITECTURE — SIX SEPARATE MATTERS, NEVER COLLAPSED

The blocks below are **constitutionally distinct**. Accepting one does **not** accept another;
this record's purpose is that they can be accepted or rejected **individually**:

| # | Matter | Character | Status today |
|---|---|---|---|
| **A** | **IRR baseline designation** — which IRR commit is *designated* as the Gate B implementation baseline (a designation of the existing authoritative line, **not** a promotion of any lineage) | **Decision required now** | `PENDING AUTHORITY REVIEW` |
| **B** | **Permission to create/designate the exact IRR implementation ref** — creation of `refs/heads/gate-b/local-principal-ipc-implementation` at the exact commit object (a ref-inventory mutation; requires explicit naming per the request's §3 determination) | **Decision required now** | `PENDING AUTHORITY REVIEW` |
| **C** | **IRR Gate B implementation authority** — permission to author/commit the scoped IRR implementation on that basis | **Decision required now** | `PENDING AUTHORITY REVIEW` |
| **—** | **Dependency on the corresponding IPD authority act** — the paired IPD decision record must also be rendered; **matter C is conditional on it**. The shared `L-IPC-1` IPC contract and the matching IRR/IPD implementation baselines require **explicit coordination** between the two acts; **neither repository's approval may be inferred from the other's** | **Interdependency, stated explicitly** | paired IPD record `PENDING AUTHORITY REVIEW` (IPD PR #8, OPEN, NOT MERGED) |
| **D** | **Gate C qualification** — Q1–Q11 on the realized endpoint, incl. the mandatory **C5.1/Q9** zero-bytes qualification probe | **NOT AT ISSUE — separate later act** | NOT GRANTED · **not claimed as passed** |
| **E** | **Route admission (Gate D) and write policy / canonical-identity source (Gate E)** — incl. any change to the IRR 503 fence | **NOT AT ISSUE — separate later acts** | NOT GRANTED · 503 fence in force |

**Interdependency (explicit):** the IPD decision record (the IPD-side matter C) is conditional
on this IRR act being rendered, and this IRR act's matter C is conditional on the paired IPD
act being rendered. **A and B are IRR-local designations** and do not depend on the IPD act;
they still confer no implementation permission, and no implementation may begin until **both**
repository acts are rendered. The two acts state their own capacity and ref; each is recorded
in its own repository under its own authority; neither amends the other automatically.

## 2. EXACT IRR REPOSITORY / REF / BASELINE TUPLE

```
repository        ramkivs/iips-review-recovered
+ref (to create)  refs/heads/gate-b/local-principal-ipc-implementation
-  (must NOT exist)  [verified: gate-b/* refs on the IRR remote = 0]
+starting commit   10584439f33dfa9192955c3f74879f20ccaf111e
-  (= IRR main tip; tree df7e754618cb7b0500966d8fdf84c5598f4b2b24;
-   parents eb4bf820c62eb3e2f5c628a95d59c8f967e3f629 + 7a07dc37490cfde8c250efedd09a26f28d91e726;
-   the authoritative tip that includes the effective DP-1 amendment, merged via PR #118)
+carrier ref       refs/heads/main (published; the starting commit is main's own tip)
```

| Existing ref | Tip | Effect of A/B/C |
|---|---|---|
| `main` | `10584439f33dfa9192955c3f74879f20ccaf111e` | **untouched** |
| `arena/075f10df-iips-review-recovered` (PR #117) | `7fcb7ba15d0dc2708e4570b526e83e0049368dd0` | advances only by additive documentation commits (this record is the only addition) |
| `arena/8aff8266-iips-review-recovered` (DP-1 amendment publication branch; merged via PR #118) | `7a07dc37490cfde8c250efedd09a26f28d91e726` | **untouched** |
| `arena/d57c506a-iips-review-recovered` (PR #114) | `e331995a94b704e078b27a70a36cbc161311fd09` | **untouched** |

**What the designation is NOT:** not a promotion, merge, cherry-pick, re-pin, or admission of
the off-main G24 lineage (`6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`) or of the IPD Gate A
derivative ref (`2ded0e981407b38c73bdea164153f53856aa7217`); **not** an IRR-side amendment;
**not** an activation of any route or capability; **not** a write path; **not** an
effective-on-`main` capability. Unlike IPD, **no off-main IRR lineage is required**: IRR `main`
already carries everything the IRR side of this boundary must extend — the claim-refusal
enumerations, the owner-context resolver, the port and boundary contracts, and the two 503
fence files.

## 3. PERMITTED IMPLEMENTATION SCOPE (matter C) — EXACT FILES, RESPONSIBILITIES, TESTS, UNCHANGED FILES, EXCLUSIONS

### 3.1 May be created (new files only; names are proposals open to the Authority's amendment)

| Path | Implementation responsibility |
|---|---|
| `frontend/server/user-portfolio/ipcClient.ts` | same-host IPC client to the IPD-owned endpoint (Windows named pipe; POSIX socket for dev/CI): strict framing, size caps, timeouts, **no principal, owner, tenant, or portfolio-scope field ever sent** |
| `frontend/server/user-portfolio/ownerContextFromBinding.ts` | the amended DP-1 source attribution: owner context sourced from the provisioned IPC endpoint binding; the tenant hint remains a **hint**, validated by IPD, and **fails closed** |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | adapter conforming to the existing `userPortfolioPort` contract, mapping IPD refusals (including the DP-2 2F refusal) into the existing refusal vocabulary — **no mutation on refusal** |
| `frontend/server/user-portfolio/firstPartySignal.ts` | **C9** hardening helper (first-party signal + `Origin`/`Sec-Fetch-Site` consistency) — CSRF hardening only, **never recorded as authentication** |
| `frontend/server/user-portfolio/ipcClient.test.ts`, `frontend/server/user-portfolio/ownerContextFromBinding.test.ts`, `frontend/server/user-portfolio/ipcPortAdapter.test.ts`, `frontend/server/user-portfolio/fenceUnchanged.test.ts` | the Gate B IRR test set (§9) |

### 3.2 Must remain **byte-unchanged** — and are verifiable invariants of any rendering of this act

- `frontend/server/owner-context-unavailable.ts` (`cb8db45d668d28cee7e0a52721001d579a872733`) — **fence message**, untouched;
- `frontend/server/user-portfolio-transport.ts` (`51704c12a467cd2f718a030b5036bc55c9afa73f`) — **fence behavior**, untouched: the owner-scoped routes continue to answer **HTTP 503 `owner-context-unavailable`** before any domain or persistence access;
- `frontend/server/user-portfolio/translationBoundary.ts` (`93f602fd7e78395d3cedb77ff504388a4e65012f`) — the `G2_*_CLAIM_KEYS` enumerations and `assertNoG2CallerAuthority` / `classifyG2Claims` — reused **read-only**;
- `frontend/server/executive-transport.ts` (`d1c52fe678b34295820fea0f2eac5cf408365310`) — C8 posture: loopback-only, no wildcard CORS on owner-scoped routes — untouched;
- `frontend/vite.config.ts` (`56fd482685203dc39ec03ccaa0315528a0352893`) (`allowedHosts`) — untouched.

**Read-only reuse** (existing IRR code of record for this boundary; not modified by Gate B):
`frontend/server/user-portfolio/{userPortfolioBoundary,userPortfolioContract,userPortfolioPort}.ts`
(blobs `b8024c6b…`, `0dec72eb…`, `ba0001e8…`) and their tests, including `option2F.test.ts`
and `translationBoundary.test.ts`.

**Explicitly deferred to Gate D:** any change to the transport that would let a request reach
the IPC path, and therefore any change to the two fence blobs. **Gate B must not file a byte
into either fence file.** The established fence and its verified identities are preserved until
a separately authorized later gate explicitly changes them.

### 3.3 Exclusions — prohibited within Gate B

Removing, bypassing, weakening, or shadowing the 503 fence; enabling owner-scoped routes;
changing listen host, CORS, or `allowedHosts`; adding any second store, credential, issuer,
token, service account, or browser-supplied identity; touching IPD code; any schema, migration,
or database change; any new runtime dependency; production or deployment artifacts; any change
to the §3.2 byte-unchanged set or the read-only reuse set.

## 4. IPC MECHANISM AND TRUST BOUNDARY (as accepted; not re-opened)

The IRR process opens the IPD-owned same-host endpoint as an ordinary local process under the
operator's own account — no service, no elevation, no separate account, no credential. IRR
**supplies no principal, owner, tenant, or scope**: the arrival of a request on that endpoint
*is* the principal (C3), and **no peer process identity is claimed or available**. A
same-account process, including malware, is **outside** the protection boundary (disclosed, not
mitigated). The browser carries no authority and cannot open the endpoint. No TCP, HTTP, mTLS,
OIDC, token exchange, forwarded principal, or service credential is part of this path.

## 5. `L-IPC-1` C1–C12 — OBLIGATIONS APPLICABLE TO THIS IMPLEMENTATION (IRR side)

| Clause | IRR-side obligation |
|---|---|
| **C1** One privileged surface | IRR exposes **no** network surface for owner-scoped operations; its only path to them is the same-host IPC endpoint |
| **C2** Endpoint owned by IPD | IRR **never** creates, binds, or listens on the endpoint; it is a client only |
| **C3** One principal, no wire identity | IRR sends **no** principal, owner, tenant, membership, or portfolio-scope value, and never mints or forwards one |
| **C4** Two ordinary processes, no service, no elevation | IRR runs as the operator's ordinary process; no service install, no elevation |
| **C5.1–C5.5** Compensating design rules | the client must tolerate the no-bytes rule (no pre-request output, no banner expectation), send exactly one well-formed request per operation, apply timeouts and size caps, and fail closed if the endpoint is absent, stale, or refuses — **never** retry onto another surface or fall back |
| **C6** Fail closed, uniformly | IRR maps every refusal to the existing indistinguishable "not found"-style vocabulary; **no owner disclosure**; no partial effect |
| **C7** Refusal of caller-supplied authority | IRR **keeps** its existing refusal of the enumerated claim classes at its own boundary and renders **no** owner-context value from caller-supplied claims; IPD re-enforces the same refusal independently (IPD act §6) |
| **C8** Loopback-only posture | unchanged and preserved (§3.2 read-only files); no LAN/preview/reverse-proxy posture |
| **C9** Cross-site hardening (not authentication) | implemented as the helper in §3.1 and applied to owner-scoped state changes **without** being called authentication |
| **C10** Provisioned, opaque, one-to-one binding | IRR treats the binding as opaque and one-to-one; it creates no equivalence to any other identity domain and derives no identity from the wire |
| **C11** No parallel store | IRR introduces **no** store, cache-of-record, or side file for portfolio data |
| **C12** Canonical identity | see §6 |

## 6. C12 — CANONICAL IDENTITY TREATMENT (explicit)

1. IRR **never** supplies or forwards `companyId`, `runtimeCompanyId`, `identityStatus`,
   `resolutionDisposition`, symbol/ISIN/exchange-shaped identity, or any caller-controlled
   identity value on this path — and **refuses** requests that carry them (existing
   `translationBoundary` enumerations, preserved read-only).
2. **IPD performs the canonical resolution or refusal**; IRR does not manufacture, default, or
   "repair" an identity, and does not convert a refusal into a success.
3. Zero (`UNMAPPED_IDENTIFIER`) or conflicting (`AMBIGUOUS_COLLISION`) resolution ⇒ the
   operation is **refused**, with **no mutation, no revision, no holding row, and no success
   response**.
4. **No bypass**: `NON_PRODUCTION_OPERATOR_BYPASS` and any false canonical-provenance
   declaration are **not** emitted, ported, or admitted on this path.
5. **No successful write is authorized by any rendering of this act**; the write policy is Gate
   E's, and until then the adapter must surface refusal, not an optimistic result — and must
   never claim durability for a session-scoped or in-memory result.

## 7. REFUSAL, FAIL-CLOSED, AND PROHIBITED BYPASSES

Required: fail closed when the endpoint is absent/refusing/stale (no fallback, no retry onto
another surface); no bytes emitted or consumed before a valid request; no owner-existence
disclosure; no partial effect; refusal of caller-supplied authority and of unresolved/ambiguous
identity; refusal mapping that is indistinguishable for "absent" and "unauthorized".
**Prohibited:** any bypass (multi-user, hosted-preview, wildcard CORS, debug flag, "temporary"
un-fencing); any credential injection; any fabricated owner/tenant/portfolio scope;
representing a refusal or a session-scoped outcome as a durable save.

## 8. CONTROLS PRESERVED BY ANY RENDERING OF THIS ACT (unchanged, in force)

**IRR HTTP 503 `owner-context-unavailable` fence — in force and byte-unchanged until Gate D**;
**DP-2 Option 2F** — unresolved/ambiguous holdings refused for persistence, before
serialization, port call, or persistence; **C11** single store (IPD's); **H-18** one user / one
personal laptop / non-production; the **effective DP-1 amendment** (blob `c71661a1…` @ IRR
`main` `10584439…`), including its self-asserted, single-user, non-production labeling and its
prohibition on generalisation; **all four Gate V PA waivers remain accepted and are not
reopened** — V-1 ACL/SDDL capture, V-4 pipe collision/re-bind, second-account access,
remote-machine access (**waivers, not technical proof**; the effective ACL/SDDL, cross-account
isolation, remote isolation, and lifecycle fail-closed behaviour remain technically
unverified).

## 9. REQUIRED TESTS AND EVIDENCE — GATE B **vs** GATE C (kept strictly separate)

**Gate B (implementation, matter C) requires:** the §3.1 test files passing on the designated
basis, covering — IPC client framing/timeouts/caps and correct failure on absent/stale/refusing
endpoints; the client sends **no** identity/scope field (asserted on the wire form);
owner-context-from-binding behavior including the fail-closed tenant hint; adapter refusal
mapping with **no mutation on refusal**; C9 helper behavior; and a **fence-unchanged regression
test proving the owner-scoped route still answers HTTP 503 `owner-context-unavailable` and that
both fence blobs are byte-identical to `cb8db45d…` / `51704c12…`**. Plus the published
implementation diff and commit identities. **Gate B evidence is not qualification evidence.**

**Gate C (qualification, matter D) — deferred, and nothing here may claim it:** Q1–Q11 on the
realized endpoint, including the **mandatory C5.1/Q9 zero-bytes qualification probe (NOT
EXECUTED AND NOT CLAIMED AS PASSED)**, C5.3/C6 startup fail-closed, the refusal matrix on the
realized endpoint, owner/tenant isolation, revision/lifecycle, durability across restart,
exactly-one-store, drift check — plus the Gate V measurements on the deployment host (where a
V-E item would repeat one of the four waived measurements, **the waiver governs**). **Gate C
has not passed; Q1–Q11 remain deferred.**

## 10. EXPLICIT EXCLUSIONS — NOT AUTHORIZED BY ANY DISPOSITION HERE

The following are **prohibited** absent separate, explicit authority:

1. Gate C qualification, and any claim arising from it;
2. **Gate D** route/consumer admission — including any change to the 503 fence and any
   activation of the owner-scoped routes;
3. **Gate E** write policy / canonical-identity source designation — durable portfolio writes,
   successful writes, successful-save claims;
4. **P-6** and **P-8**; provisioning or credentials of any kind;
5. production eligibility, deployment, certification, or "ready" claims;
6. removing or relaxing the fence, DP-2 Option 2F, C11, or H-18;
7. any change to IPD source or to the IPD store;
8. **promotion, merge, cherry-pick, re-pin, or admission of the unadmitted G24 off-main lineage
   (`6828155…`) or of the IPD Gate A derivative ref (`2ded0e98…`)**;
9. **merging PR #8 (IPD), PR #117, PR #114, or any IRR PR**;
10. creating, moving, or deleting any IRR ref other than the single ref named in matter B;
11. OIDC, Keycloak, RBAC, multi-user or enterprise tenancy; a second store; a Windows service
    or separate service account.

## 11. STOP CONDITIONS, ROLLBACK, AND FAIL-CLOSED EXPECTATIONS

**Stop before any mutation if:** IRR `main` is no longer `10584439…`; either fence blob differs
from `cb8db45d…` / `51704c12…`; the proposed basis ref exists with a different tip; the paired
IPD act is not rendered (the two acts are interdependent); or any required behavior cannot be
implemented inside §3 (scope expansion ⇒ stop and report, never improvise). **Rollback:**
revert the IRR implementation commits on the Gate B basis ref; nothing else is touched — **no
fence, route, or runtime behavior is altered by design**, so no rollback of behavior exists.
**Fail-closed:** absent/refusing endpoint ⇒ the operation fails closed; refusal mapping must
never disclose owner existence.

## 12. DECISIONS THE AUTHORITY MUST EXPLICITLY ACCEPT OR REJECT

Each item is to be dispositioned **individually** as `ACCEPT` / `ACCEPT WITH CHANGES` / `REJECT`
/ `DEFER`, in the Authority's own words:

| # | Decision | Disposition |
|---|---|---|
| **D-1** | **IRR baseline designation** — designate IRR `main` commit `10584439f33dfa9192955c3f74879f20ccaf111e` (tree `df7e7546…`) as the Gate B implementation baseline | `PENDING AUTHORITY REVIEW` |
| **D-2** | **Ref creation** — authorize creating **one** new ref `refs/heads/gate-b/local-principal-ipc-implementation` at exactly that commit object, non-forced, with **no other ref** created, moved, or deleted, and **no PR** opened from it | `PENDING AUTHORITY REVIEW` |
| **D-3** | **Form of D-1/D-2** — render them as **one combined act**, as a **separate prior baseline-designation act**, or as an element of the Gate B act (D-4); the Program Authority chooses | `PENDING AUTHORITY REVIEW` |
| **D-4** | **IRR Gate B implementation authority** — authorize the scoped implementation of §3.1 on that basis, under the §4 mechanism and the §5 C1–C12 obligations, **conditional on the paired IPD act being rendered** | `PENDING AUTHORITY REVIEW` |
| **D-5** | **Preservations** — confirm DP-2 Option 2F, C11, H-18, the 503 fence, the DP-1 amendment, and all four Gate V waivers remain in force and un-reopened (§8) | `PENDING AUTHORITY REVIEW` |
| **D-6** | **Gate C boundary** — confirm Q1–Q11 (incl. **mandatory C5.1/Q9**) remain deferred and unclaimed, and that matter C's disposition grants no qualification result (§9) | `PENDING AUTHORITY REVIEW` |
| **D-7** | **Prohibitions** — confirm the §10 prohibitions stand, and that Gates D/E, P-6, P-8, and the merging of PR #117 (or PR #114 / IPD PR #8) each require separate acts | `PENDING AUTHORITY REVIEW` |
| **D-8** | **Paired IPD act and coordination** — acknowledge that matter C is conditional on rendering of the paired IPD act `IIPS-V3-G2-IPD-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` (currently `PENDING AUTHORITY REVIEW` at IPD PR #8), and record how/when explicit coordination of the shared IPC contract and matching implementation baselines will be achieved; **neither repository's approval may be inferred from the other's** | `PENDING AUTHORITY REVIEW` |

**Optional narrowing available to the Authority:** accept D-1/D-2 (basis only) and **DEFER**
D-4 — implementation then remains blocked while the baseline exists.

**Rendering mechanics:** the decision is rendered by the Program Authority and recorded by the
Recording Agent as a **subsequent additive artifact** in this workstream; it must state the
Authority's capacity, the repository/ref, the exact disposition per item, and the date. **This
record fabricates no approver, signature, or approval, and none may be inferred from it.**

## 13. EXACT PROPOSED DECISION TEXT (for the Authority's convenience — optional)

> **IRR Gate B — implementation authority.** I, Ramki, as Program Authority, acting in the IRR
> capacity for `ramkivs/iips-review-recovered`, decide: **(D-1) DESIGNATE** as the Gate B
> implementation baseline IRR `main` commit `10584439f33dfa9192955c3f74879f20ccaf111e` (the
> authoritative tip carrying the effective DP-1 amendment); **(D-2) AUTHORIZE** creation of
> exactly one new ref `refs/heads/gate-b/local-principal-ipc-implementation` at exactly that
> commit object, non-forced, with no other ref created, moved or deleted, and no pull request
> opened from it; **(D-4) AUTHORIZE Gate B implementation** within the exact permitted scope of
> this record §3, on that basis, under the IPC mechanism of §4 and the C1–C12 obligations of
> §5, **conditional on the paired IPD act**
> `IIPS-V3-G2-IPD-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` **being rendered**;
> **(D-5) CONFIRM** DP-2 Option 2F, C11, H-18, the IRR 503 fence, the DP-1 amendment and all
> four Gate V waivers remain in force and un-reopened; **(D-6) CONFIRM** Gate C (Q1–Q11
> including the mandatory C5.1/Q9 zero-bytes qualification probe) remains deferred and no
> qualification result is claimed; **(D-7) CONFIRM** the §10 prohibitions stand and that Gates
> D/E, P-6, P-8 and the merging of PR #117 each require separate acts; **(D-8) DIRECT**
> explicit coordination with the paired IPD authority act for the shared IPC contract and
> matching implementation baselines. This act does **not** promote, merge, cherry-pick, re-pin,
> or admit the off-main G24 lineage or any IPD ref; does **not** move any existing ref or IRR
> `main`; does **not** change the designated baseline commit; does **not** alter the two 503
> fence files; does **not** authorize any route admission, durable write, successful-save,
> production, or qualification claim. **Disposition per item:** `ACCEPT` / `ACCEPT WITH
> CHANGES` / `REJECT` / `DEFER`.

## 14. VERIFIED STATE AT PREPARATION (live remote, read-only)

| # | Item | Verified value |
|---|---|---|
| 1 | IRR `main` | `10584439f33dfa9192955c3f74879f20ccaf111e` (= merge commit of PR #118, 2026-10-16T23:22:23+05:30; tree `df7e754618cb7b0500966d8fdf84c5598f4b2b24`; parents `eb4bf820…` + `7a07dc37…`) |
| 2 | DP-1 amendment **effective on `main`** | blob `c71661a1ee445b2348cedfedae4aef6449029ebb`, 17,128 B — status **"AMENDED FOR ONE DEPLOYMENT — CONTRACT POSITION ONLY"**; §3 amends five clauses; §5 aligns IRR DP-1 to the accepted IPD `L-IPC-1` |
| 3 | 503 fence | `frontend/server/owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733`; `frontend/server/user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f` — **unchanged** |
| 4 | `gate-b/*` refs (IRR remote) | **0** — none exists |
| 5 | IRR Gate B request (inputs re-verified before recording) | blob `3e88ebecf702f70a5c60d5ea105e916e3af99acd` @ PR #117 head `7fcb7ba15d0dc2708e4570b526e83e0049368dd0`; proposed basis ref `refs/heads/gate-b/local-principal-ipc-implementation` and starting commit `10584439f33dfa9192955c3f74879f20ccaf111e` (request §3) — recorded verbatim in §2; **no new baseline or ref invented** |
| 6 | IRR PR #117 | **OPEN, unmerged**, base `main`, head `arena/075f10df-iips-review-recovered` @ `7fcb7ba15d0dc2708e4570b526e83e0049368dd0` (based on `eb4bf820…`, one merge behind `main`); PR #114 (`arena/d57c506a…`) remains open separately — neither is merged; no competing PR is created |
| 7 | Paired IPD decision record | `evidence/np04/IIPS_v3.0_G2_IPD_GATE_B_IMPLEMENTATION_AUTHORITY_DECISION_RECORD_2026-10-16.md` @ IPD PR #8 head `6a95a3294f0e2b7c3edaaa41c92a904b90d34792` (branch `arena/21c63aef-iips-production-market-data`, **OPEN, NOT MERGED**) — status **`PENDING AUTHORITY REVIEW`**, **not approved**; this IRR record is aligned with it and remains independently reviewable |
| 8 | IPD basis (by reference, read-only) | IPD `main` `70b24f029842a7e9b7f615e4d9df7376fd4ff817`; Gate A derivative `refs/heads/gate-a/local-principal-enablement-2026-10-16` @ `2ded0e981407b38c73bdea164153f53856aa7217` (parent `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`); IPD `gate-b/*` refs = 0 |
| 9 | Prior "Gate B"-named IRR records | four 2026-10-13 records about **reports ownership source / option C** — a **different track** (Reports Gate B, `REG-11`); they are **not** G-2 Gate B implementation-authority records and are not relied on here |

## 15. ATTESTATION

| Check | Result |
|---|---|
| Authority rendered by this record | **NONE** — `PENDING AUTHORITY REVIEW`; no approver, signature or approval fabricated or inferred |
| Refs created / moved / deleted | **NONE** (IRR `gate-b/*` = 0; IRR `main` untouched) |
| Implementation authored or committed | **NONE** |
| Application behavior changed | **NONE** |
| 503 fence | **PRESERVED byte-identical** (`cb8db45d…` / `51704c12…`) |
| IPD repository touched | **NO** (this artifact is IRR-side only; `L-IPC-1` C1–C12, the DP-1 amendment and the 503 fence are preserved by reference and by the paired IPD record) |
| Proposed implementation ref created | **NO** (`refs/heads/gate-b/local-principal-ipc-implementation` does not exist) |
| PR #117 / PR #114 / IPD PR #8 merged | **NO** |
| Gates C/D/E advanced; P-6/P-8 granted | **NO** |
| New artifacts | **exactly one** — this decision record |

*End of decision record `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-DECISION-RECORD-2026-10-16-01`
— **⛔ PENDING AUTHORITY REVIEW · GATE B NOT GRANTED · IMPLEMENTATION BLOCKED · 503 FENCE
UNCHANGED · NON_PRODUCTION**.*
