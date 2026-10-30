# IIPS v3.0 — NP-06 Reports: `R2` `C-4` Request-Header Claim Handling — Program Authority Decision Request

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-C4-HEADER-CLAIM-PA-DECISION-REQUEST-2026-10-30-01` |
| **Record type** | **DECISION REQUEST — DECISION INPUT ONLY.** Not a decision, not an approval, not an authorization, not an amendment to any act, not an admission, and not a qualification record. |
| **Status** | **PROPOSED — NOT APPROVED / NOT EFFECTIVE.** Nothing here is operative. No option is selected, no behaviour is changed, and no ruling may be inferred from this document or from silence. |
| **Prepared** | `2026-10-30` (Asia/Calcutta) — actual date; not backdated |
| **Prepared under** | Standing one-pass execution authority for in-scope investigation, evidence collection and documentation; the published investigation `§16.213` (`CV-CORR-193`, `CHG-2026-10-30-07`, `V1614`–`V1623`); and outstanding item **`D-9`** (`§16.190.5`, `§16.190.3` leg 5, `§16.190.8(a)`, `V1396`, `§18.1` row 35 cell 15) |
| **Decision-maker** | Program Authority (PA) — Ramki. **The agent renders no authority, selects no option and supplies no ruling.** |
| **Supersedes** | **Nothing.** It *narrows*. `§16.213.8` put a two-option question about F-7 wording versus test evidence. This request establishes that a prior question — the operative meaning of `C-4`'s request-header limb — must be decided first, and that the wording/evidence question becomes a **consequence** (Decision 2, tracker §16.214.6). `§16.213` remains the historical investigation record and is not rewritten. |
| **Verified baseline** | IRR `main` = `fb73080f6a603d50fb035d63d81c6f3c0896d592`, tree `9b564ec8a0f1cfe6adca9112e6d1f078bf80f737`, post-merge CI run `41073649209` **SUCCESS**; **one** open IRR PR (**#382**, `CONFLICTING`, head `c0e9ce66…`). IPD `main` `aa356ec222527e78462740fb6c91d34b9ff6cbbc`, tree `79a9fb6c…` — **read-only, zero writes**. |
| **Preserved** | `R1`, `R2`, `R3` acts **EFFECTIVE**; F-7 `SATISFIED`; capability acceptance `ACCEPTED (bounded non-production)`; `CV-51` `ACCEPTED/CLOSED` (read-only UI); production **NOT ADMITTED**; `REG-11` **Option C**; `CV-21`/`DQ-7a` A2 disposition; the three IPD pins; `O-06` and `O-07` closures; Gate 3/4/5 and `P-1` states. No gate, pin, acceptance or authorization moved in this pass. |

> **Bottom line.** The effective `R2` act (`C-4`) says client-supplied tenant or identity claims **in request headers**, URL query parameters, or request bodies are **refused with `400 Bad Request`**. The accepted transport enforces the query and body limbs and **never reads request headers at all**, so a header-borne claim is silently ignored and the request succeeds. No committed test covers the header limb, and **no version of `reports-transport.ts` has ever scanned request headers for identity/tenant claims** — the gap is as old as the transport. This document asks **one** question: whether `C-4`'s request-header limb is operative as written. Everything downstream — implementation, tests, F-7 legs 2 and 5, the leg-5 verdict, the qualification status and `D-9` — follows from the answer. It selects nothing.

---

## 1. Why this is the smallest complete ask

`D-9` was recorded in `§16.190.5` as a wording gap with a two-way choice (amend the record, or add a test). The `2026-10-30` investigation (`§16.213`) showed that framing was incomplete: a third item exists that neither option repairs — `R2` `C-4`'s **request-header** limb is unimplemented, and it is not a wording question but an operative sentence of an effective PA act.

That item cannot be resolved by choosing a test or a wording change, because both of those choices presuppose an answer to "what does `C-4` require of request headers?". Deciding the test first would institutionalise whichever behaviour happens to exist; deciding the wording first would describe behaviour that may be non-conformant. So the sequence is fixed:

1. **This request — Decision 1:** the operative meaning of `C-4`'s request-header limb.
2. **Decision 2 (not prepared here):** the F-7 qualification consequences, including legs 2 and 5, the `PROVEN` verdict and any status change.
3. Only then: implementation, tests, record amendments, requalification, publication and `D-9` closure.

Nothing else is asked of PA in this pass.

## 2. The two categories, kept separate

The register has been careful about credentials; it has not been careful about *claims*. They are different things and this request does not merge them.

| | **A. Ambient authentication credentials** | **B. Client-supplied identity / tenant claims** |
|---|---|---|
| **Examples** | `Authorization: Bearer …`, `Authorization: Basic …`, cookies | `X-Tenant-Id`, `tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`, `X-Authenticated-User` |
| **What the contract says** | `C-2`: "no caller credential exists"; the historical `401 Unauthorized` is **retired**. `C-3`: no separate role-based authorization step. | `C-4`: claims "in request headers, URL query parameters, or request bodies …" are "**refused with `400 Bad Request`**". |
| **What the implementation does** | Never read. No credential can establish identity. **Conformant by construction with `C-2`/`C-3`.** | Query and body: refused `400`. **Headers: ignored.** |
| **Existing executed test evidence** | None in-tree. Behaviour observed by the `2026-10-30` probe (`§16.213.5`), which is **not** durable CI evidence. | Query and body: committed tests. **Headers: none.** |
| **Is this category in dispute here?** | **No.** `C-2` requires no error response for a credential, and the transport's silence is the intended posture. The only residual question is F-7's *word* "rejects" (Decision 2). | **Yes.** This is the entire subject of Decision 1. |

The trap this separation avoids: "the header claim is ignored, therefore it cannot change identity, therefore `C-4` is satisfied". That inference is valid for **category A** and invalid for **category B**, because `C-4` specifies a *response*, not merely an *outcome*.

## 3. Exact authoritative text

### 3.1 `R2` act (`e3ad095e23ff93b71eb4dd1ba57696d0127261e2`, 6,466 B) — verbatim

- **`C-2` — Boundary Failure & Replacement for `401`:** "On the current no-authentication baseline, no caller credential exists." / "The historical `401 Unauthorized` response is retired." / carrier failure → `503 owner-context-unavailable`.
- **`C-3` — Authorization Predicate (Option `P-1` Approved):** "the server-owned declaration `(irr-reports-personal, owner-irr-reports-personal)` identifies the partition under which all five governed operations execute"; "No separate role-based authorization step is performed. The historical `viewer`/`analyst`/`admin` role gate is **retired by express PA decision**."; "The declaration carries partition semantics only and does not authenticate the caller."
- **`C-4` — Client Tenant/Identity Claims Disposition:** "Any client-supplied tenant or identity claim in request headers, URL query parameters, or request bodies (`tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`) is **refused with `400 Bad Request`** (`{ error: 'client-supplied tenant or identity claims are prohibited' }`)." / "The historical foreign-tenant `403` status is retired because no tenant authority exists for a claim to be foreign to."
- **`C-6` — Server-Side Resource Namespace Allowlist:** "The authorized resource namespace is strictly server-constant `reports.*` (never client-derived)."

### 3.2 F-7 record (`77fc793c301159b28e5b84d2e9300e3afaa242a1`, 5,595 B) — verbatim

- **Leg 2 (bar):** "Cross-owner queries return 404 without existence disclosure. **Client-supplied identity/tenant claims rejected.**" Evidence recorded: query `?tenantId=…` → `400`; body with `tenantId`/`userId`/`reportId` → `400`; unknown `reportId` → `404`. Verdict **`PROVEN`**.
- **Leg 5 (bar):** "No client-supplied identity is accepted, roles are retired, and no authentication credential is inferred." Evidence: "Transport applies single declared owner partition (`P-1`); **rejects ambient auth tokens**; enforces server-constant namespace `reports.*`." Verdict **`PROVEN`**.

Neither leg's recorded evidence names a request header.

### 3.3 Context only — `CV-51` acceptance criterion `AC-CV51-05`

"Client never transmits `tenantId`, `userId`, `owner`, `ownerUserId`, `authenticatedUser`, `principal`, `companyId`, or `runtimeCompanyId` in URLs, query parameters, **headers**, or bodies" (`IIPS_v3.0_REPORTS_NP06_CV51_READINESS_INVESTIGATION_AND_IMPLEMENTATION_PLAN_2026-10-25.md`).

This is a **client-side** discipline that reduces exposure. It is **not** a server-side refusal requirement and does **not** discharge `C-4`, which governs what the server does when such a claim *arrives*. It is cited so that the two are not confused.

## 4. Actual implementation behaviour

All observations are from the accepted transport at blob `775d282bc50f67993a58d6e6d1c7dd45e4aceeac` — byte-identical to the blob the `§16.213` probe exercised, so the observed behaviour is unchanged at the current `main`.

| # | Fact | Anchor |
|---|---|---|
| 1 | `handleReportsRequest` reads `req.url`, `req.method` and (POST) the JSON body. **`req.headers` is never dereferenced.** | `reports-transport.ts` L167–L182, L195 |
| 2 | Identity and tenant come only from `resolveReportsOwnerContext()` (server-owned carrier). | L188; `reports-owner-resolver.ts:35` |
| 3 | Client claims are checked in the **query string** and in the **JSON body** only, both → `400 client-supplied tenant or identity claims are prohibited`. | L195–L203 (query), L216–L221 (create), L252–L257 (append) |
| 4 | `/api/reports*` is dispatched at `executive-transport.ts:755`; no authentication, first-party or header-inspecting middleware precedes it. | `executive-transport.ts` L744–L767 |
| 5 | **Historical:** the pre-`R2` transport (`4906a6b7`, 540 lines) scanned claims from query/body only and used `req.headers.authorization` solely as a bearer credential (`:417`); the `1f7997e5` fence stub (73 lines) reads no headers. **No version has ever refused header-borne claims.** | `gh api …?ref=4906a6b7` / `?ref=1f7997e5` |
| 6 | `C-6` is implemented in substance: fixed `REPORTS_ROUTES` table (5 patterns) + `/api/reports` prefix dispatch. | L41–L47, L108; `executive-transport.ts:705`, `:755` |
| 7 | Repo precedent for header handling elsewhere is "drop, do not refuse": `firstPartySignal.ts` drops authentication-shaped headers before evaluation. | `user-portfolio/firstPartySignal.ts` L150–L168 |

Observed end-to-end (real handler, real carrier, real SQLite; `§16.213.5`, probe deleted, not committed):

| Request | Observed status | Body / effect |
|---|---|---|
| `GET /api/reports/context` (no headers) | `200` | declared owner `irr-reports-personal` / `owner-irr-reports-personal` |
| `GET /api/reports/context` + `Authorization: Bearer`/`Basic`/claim-shaped token | `200` | **byte-identical to the no-header response** |
| `GET /api/reports/context` + `X-Tenant-Id`, `tenantId`, `userId`, `principal`, `X-Authenticated-User` | `200` | **identical** — claims ignored |
| `POST /api/reports/artifacts` + `Authorization: Bearer …` | `201` | store-minted `reportId`; `ownership` = declared pair |
| **`POST /api/reports/artifacts` + six header-borne identity claims** | **`201`** | **store-minted `reportId`, artifact persisted**, `ownership` = declared pair. `C-4` requires `400`. |
| `GET /api/reports/artifacts?tenantId=foreign-tenant` | `400` | `{"error":"client-supplied tenant or identity claims are prohibited"}` |

## 5. Existing executed test evidence

| Requirement | Committed test | Executed evidence |
|---|---|---|
| Query claim → `400` | `reports-transport.test.ts`, "executes full 5-operation contract with single declared owner and rejects client claims" (step 2) | Yes — 171-test Reports scope and full CI at `fb73080f` |
| Body claim → `400` | same test (step 3) | Yes |
| Durable-identity injection → `400` | same test (step 4) | Yes |
| Route/method/namespace boundary | "preserves route/method validation regardless of carrier presence"; `reports-restart.test.ts` fence assertions; `owner-context-integration.test.ts` | Yes |
| **Header claim → `400`** | **none exists** | **No executed evidence** |
| Ambient `Authorization` has no effect | **none exists** | Probe only (`§16.213.5`), **not durable** |

The probe is cited as an observation, **not** as regression coverage. No claim here rests on a declaration that was not executed.

## 6. The demonstrated difference between refusing and ignoring

| | `C-4` as written (`400`) | Current behaviour (ignore) |
|---|---|---|
| Status returned for a claim-bearing `POST` | `400` | **`201`** |
| Artifact created | none | **yes — store-minted `reportId`, persisted in the NP-04 store** |
| Signal to the caller | explicit refusal, named reason | **none**; the request appears to have succeeded normally |
| Identity/tenant outcome | unchanged (declared pair) | unchanged (declared pair) |
| Auditable trace | a refused request | nothing; `C-7` request-time audit is deferred by `A-2` |

The security-relevant outcome is identical in both columns, because `C-2`/`C-3` leave no authority for a header to reach. The difference is **contractual and evidentiary**: under the current behaviour a request the effective act says must be refused instead **writes a durable artifact and returns success** under the server-owned partition. No cross-tenant leak is possible; no refusal occurs.

## 7. Decision 1 — Option 1: literal enforcement

`C-4`'s request-header limb is operative as written. Consequences, stated precisely:

- **Behaviour:** a request carrying a claim-shaped header (matched case-insensitively against the `C-4` key set and reasonable header spellings) is refused with `400` and the existing `client-supplied tenant or identity claims are prohibited` body, before any handler-level work for that request.
- **Placement (a decision detail, not a new question):** the check belongs beside the existing query check (after owner-context resolution, `reports-transport.ts` L195), so the established precedence is preserved — with an unresolvable carrier the request still returns `503 owner-context-unavailable`, exactly as a claim-bearing query request does today. Placing it before carrier resolution would make `400` win over `503` and would change behaviour beyond `C-4`.
- **Implementation:** one helper plus one call site in `frontend/server/reports-transport.ts`; no route, schema, contract or dependency change.
- **Tests:** the six required cases (header tenant claim → `400`; header identity claim → `400`; query → `400`; body → `400`; ambient `Authorization` cannot establish identity or tenant; valid declared-owner requests still succeed), plus existing route/method and namespace assertions — in `reports-transport.test.ts`, with at least one case against the composed server in `reports-api.test.ts`.
- **Qualification:** F-7 leg 2 must be **re-evidenced**, not merely re-worded, because its recorded evidence does not cover headers; leg 5's "rejects ambient auth tokens" wording is re-examined in Decision 2; the historical `PROVEN` verdicts and the `SATISFIED` status are Decision-2 matters, not implementation matters.
- **Resolves:** conformance with `C-4`'s operative text; gives durable CI evidence for a currently untested limb.
- **Does not resolve:** `C-2`/`C-3` behaviour (already conformant); `C-6` terminology (unchanged); the `D-9` wording component.
- **Owning repository / files:** IRR (`frontend/server/reports-transport.ts`, its tests, and an amended F-7 record only if Decision 2 so directs).
- **Validation:** targeted tests, full Reports scope, `test:ci`, typecheck, replay-server typecheck, build, PR CI, post-merge CI, remote read-back.
- **Risks:** changes the client-visible behaviour of an accepted capability (one new `400` path); requires requalification of an affected leg; a client that today sends such a header would begin receiving `400` (that is the point of the clause, but it is a real behavioural change).
- **Scope / acceptance effect:** **none by itself.** It does not alter bounded non-production acceptance; any status change is Decision 2.
- **Additional authority:** PA authorization to change an accepted capability's behaviour and to requalify.

## 8. Decision 1 — Option 2: explicit authoritative clarification

PA determines that `C-4`'s request-header wording is **not** intended to require an HTTP refusal for claims that are ignored, and changes the operative contract explicitly. The clarification itself must state:

1. the relationship among `C-2`, `C-3` and `C-4` (no credential exists; no role step; the partition is server-owned; claims can never be authoritative);
2. that **ambient authentication credentials** (category A) and **client-supplied identity/tenant claims** (category B) are distinct, and what is required of each;
3. whether a header-borne claim **may be ignored**, and that it **must remain incapable** of affecting identity, tenant selection or authorization;
4. **whether any refusal response is required** for header-borne claims — and, if none, that silence is conformant;
5. the **disposition of `C-4`'s existing request-header wording** — whether it is amended, superseded, or read down by a dated note;
6. the **vehicle**: an amendment act, or a dated additive clarification note in the `G2-D4` style (§11.1 of the G2 amendment: "additive; historical text preserved; amends no clause; grants no authority"), published to `refs/heads/main` and read back.

Consequences: no implementation change; regression tests would assert **non-effect** (header claims cannot alter identity/tenant; responses identical to claim-free requests) rather than a `400`; F-7 leg 2's bar and evidence are clarified by Decision 2; leg 5's "rejects" wording is settled by Decision 2. **Resolves** the gap by changing the contract, not the code. **Does not resolve** the absence of any test for header claims unless a test is also authorized. **Owning repository:** IRR (the act and the amended `C-4` text, plus tests only if authorized). **Validation:** doc-only for the act; test validation if tests are authorized. **Risks:** narrows a safeguard that an effective act states; if the wording was in fact intentional, the program loses a fail-closed behaviour and gains a silent-acceptance path; the amendment is a governance act of the same weight as the original `R2`. **Scope / acceptance effect:** none by itself; Decision 2 handles statuses. **Additional authority:** PA (to amend an effective act).

## 9. Side-by-side consequences

| Dimension | Option 1 — literal enforcement | Option 2 — authoritative clarification |
|---|---|---|
| Contract text | unchanged | **amended / clarified by act** |
| Implementation | **changed** (header check, one file) | unchanged |
| New tests | six required cases, asserting `400` | non-effect assertions only |
| F-7 leg 2 | re-evidenced (headers now covered) | bar/evidence clarified (headers explicitly out of scope of the refusal) |
| F-7 leg 5 | wording reviewed; "rejects" still needs a word-level fix | same word-level fix needed |
| F-7 `PROVEN` / `SATISFIED` | Decision 2 (re-issue or annotate) | Decision 2 (annotate) |
| Capability acceptance | unchanged unless Decision 2 changes it | unchanged unless Decision 2 changes it |
| Production admission | unchanged | unchanged |
| Governance weight | implementation correction + requalification | **amendment of an effective PA act** |
| Residual risk | one new `400` path on an accepted capability | an effective act's sentence remains unimplemented unless amended |
| Reversibility | straightforward (revert a small diff, requalify) | requires a further act to restore refusal |

## 10. Recommendation

**Recommendation: Option 1 (literal enforcement).** Offered with reasons, as decision input — **not** as a ruling, and not because the literal reading is easier.

1. **The clause is operative text, not ambiguous prose.** It names three channels and specifies one response for all three. The program's "narrowest reading" canon (e.g. G2-D4 §11.1(2)) is for reconciliations of ambiguous history; it does not license reading an explicit "is refused with `400 Bad Request`" as "may be ignored".
2. **The header limb is not vestigial auth-era text.** `C-4` was written in the same act that retired the credential (`C-2`) and the role gate (`C-3`). The drafter kept "request headers" in the enumeration *after* deciding no credential would be read — the deliberate retention is evidence of intent, not accident.
3. **Within-clause consistency.** Query and body are enforced with the identical `400` and identical message. There is no principled ground on which the third enumerated channel should be treated differently, and the record supplies none.
4. **Fail-closed posture.** The program's repeated discipline is that a request it cannot validate is refused, not silently processed. Today a claim-bearing `POST` returns `201` and **persists an artifact** while the contract says it must be refused.
5. **Smaller governance act.** Option 1 conforms behaviour to the existing text: a ~10-line change in one file, plus tests and requalification. Option 2 requires **narrowing an effective PA act**, which is the heavier instrument and, under the program's own precedent (G2-D4 §11.1(4)), a change to the accepted contract rather than a clarification of it.
6. **Testability.** "Refuse with `400`" is a discrete, durable assertion. "Ignored and cannot influence anything" is a negative property that must be asserted against every channel forever.

**The honest case for Option 2**, stated so PA can weigh it: the security outcome is identical either way (identity is carrier-fixed and no code path consults a header); the repository already prefers *dropping* authentication-shaped headers over refusing them (`firstPartySignal.ts`); and Option 2 avoids changing the behaviour of an accepted capability and avoids requalifying F-7 leg 2. If PA judges the header limb was enumerative rather than operative, Option 2 is legitimate **provided** the act says so explicitly — silence must not be treated as approval either way.

## 11. The exact PA decision question and choices

**Question.** *Is `C-4`'s request-header limb operative as written, so that client-supplied identity and tenant claims arriving in request headers must be refused with HTTP `400 Bad Request`?*

| Choice | Meaning | Recorded consequence |
|---|---|---|
| **`C4-1`** | Operative as written. | Implementation correction + regression tests + F-7 leg 2 re-evidence; Decision 2 then settles verdicts and statuses. |
| **`C4-2`** | Not operative as a refusal requirement; the contract is clarified to require that header-borne claims cannot affect identity, tenant selection or authorization, and that ignoring them is conformant. | Amendment/clarification act (§8 items 1–6); tests assert non-effect only; Decision 2 then settles F-7 wording and statuses. |

A third outcome — "leave the question open" — is not offered: it would leave an effective act's operative sentence unimplemented and `D-9` open indefinitely. Deferral by PA is of course PA's prerogative, but it must be *stated*, not inferred.

## 12. Affected records, repositories and qualification boundaries

| Artifact | Repository | Effect of Decision 1 |
|---|---|---|
| `R2` act `…R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01` (`C-4`) | IRR | unchanged (§7) or amended/clarified (§8) |
| `frontend/server/reports-transport.ts` + tests | IRR | changed (§7) or unchanged (§8) |
| F-7 record `…F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01` | IRR | Decision 2 only |
| Capability acceptance / qualification statuses | IRR | Decision 2 only; unchanged by Decision 1 |
| `§16.213` investigation, `§16.214` packet record, tracker `D-9`, `§18.1` row 35 | IRR | pointer/annotation after the ruling |
| CV-51 acceptance criteria (`AC-CV51-05`) | IRR | context only; not amended |
| IPD `main` | IPD | **no effect — read-only; zero writes** |

Qualification boundaries: `C-4` is an `R2` (contract-shape) provision qualifying the **bounded non-production** Reports baseline. Nothing here reaches production admission, `REG-11` promotion, gates, pins or any other workstream.

## 13. The exact act that would close this request

One dated PA instrument, published to `refs/heads/main` and independently read back, stating:

1. the selected choice, `C4-1` or `C4-2`, in those terms;
2. under `C4-1`: that the header limb is operative, that the transport must refuse header-borne claims with `400 Bad Request`, and that implementation, tests and the affected F-7 leg are to be corrected and requalified;
3. under `C4-2`: the six clarification statements in §8, and the vehicle by which `C-4`'s existing text is amended, superseded or read down;
4. an express statement that the act does **not** change qualification status, capability acceptance, production admission, gates, pins or any other decision, and that those effects — if any — are reserved to Decision 2;
5. an express statement that no other limb of `C-2`, `C-3`, `C-4` or `C-6` is affected.

## 14. Prohibited until that act is effective

No implementation change; **no test asserting `400` for header claims**; **no test that freezes silent ignoring as compliant**; no amendment to the `R2` act or the F-7 record; no change to any qualification or acceptance status; no `D-9` closure; no other workstream touch.

## 15. What proceeds without it

This request, its tracker record (`§16.214`), the `D-9` pointer annotation, and the separate PR #382 integrity report. Nothing in the Reports implementation, tests, acts or statuses.

---

*Decision request only. `C4-1` / `C4-2` unselected. No authority rendered. Prepared `2026-10-30` at IRR `main` `fb73080f…`; IPD read-only at `aa356ec2…`.*
