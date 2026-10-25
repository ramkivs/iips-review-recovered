# IIPS v3.0 — NP-06 Reports: Consolidated `R1` Field-Completion and `R2` Field Request — Program Authority Decision Request

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R1-FIELD-COMPLETION-PA-DECISION-REQUEST-2026-10-25-01` |
| **Record type** | **DECISION REQUEST — DECISION INPUT ONLY.** Not a decision, not an approval, not an authorization, not an admission, not a value act. |
| **Status** | **PROPOSED — NOT APPROVED / NOT EFFECTIVE.** Nothing here is operative. No field value in this document is filled in, and none may be cited as filled in. |
| **Prepared** | `2026-10-25` (Asia/Calcutta) — actual date; not backdated |
| **Prepared under** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` §2(1)/§4; the PA selection `IIPS-V3-REPORTS-NP06-R1-PA-DECISION-2026-10-25-01` (`R1-Option B` **SELECTED — NOT EFFECTIVE**); and the R3 act `IIPS-V3-REPORTS-NP06-R3-PA-DECISION-2026-10-25-01` (**effective**, PR #258 merge `61db73a1800fbc6ffb9e12c59645cfb5dd055396`) |
| **Decision-maker** | Program Authority (PA) — Ramki. **The agent renders no authority and supplies no value.** |
| **Supersedes** | Nothing. `IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01` remains the record of `D-1`/`D-2`/`D-3` including the option analysis. This document **does not re-put** the already-rendered `D-3`, and **does not re-open** the already-selected `R1-Option B` path or the already-rendered `R2` disposition. It narrows the remaining ask to the exact fields that Option B's own definition requires, plus the two `R2` fields that have no selection anywhere. |
| **Verified baseline** | IRR `origin/main` = local `HEAD` = `67739e23108eeac0b0e9ce04427d622779f01a06`, tree `1316e8008c65095a65261add4994fc4fa4a79d56` (merge of PR #260); **0** open IRR PRs; post-merge `main` CI run `40183107424` **SUCCESS**. IPD `main` `4b5c65a731a66a6fa1260146a55df9ed772953a5`, **0** open IPD PRs, **read-only, 0 writes**. |
| **Preserved** | A2 (`IIPS-V3-REPORTS-CV21-DQ7A-A2-PA-DISPOSITION-2026-10-25-01`); `REG-11` **Option C**; `CV-23`; `CV-43` (closed, retained unwired); the HTTP `503` fence (blob `981470541812a64c733309f1debec75455d85bee`); pins `#2d9130e7…` / `#70b24f02…` / `#2e11fa3b…`; Gate 3 `src/persistence/*`. |

> **Bottom line.** No authoritative record anywhere in the corpus — IRR or IPD, on `main` or at the qualified historical tip — supplies a Reports tenant value, a Reports owner value, an express direction to reuse the F-3 values, the fifteen `D-2` §8 element determinations, or the value-act property set. `R1-Option B` is selected but **cannot take effect without them**, and `R2` cannot be rendered without them plus two further security fields (`C-3`, `C-7`). This document reduces the outstanding work to **one** PA act answering **seven** discrete fields. It fills none of them.

---

## 1. Why this is the smallest complete ask

`R1-Option B` is already selected. Its *shape* — a Reports-specific governed non-authentication ownership declaration, delivered through a server-owned carrier distinct from the F-3 carrier, carrying **no** authorization semantics, never accepting client-supplied identity, failing closed at `503` — is fixed by the selection record and is **not** re-asked here.

What the selection record expressly withheld, and what this document enumerates field by field, is the **substantive content**: the values, the element determinations, and the property set. Those cannot be supplied by an agent: `REG-11` Option C §2(2) forbids aliasing the F-3 pair, the commissioning §3 forbids inventing an owner or a semantic rule, and the PA instruction of 2026-10-25 forbids inventing a tenant value, ownership source, security predicate, audit semantics, or contract field.

Because `R2`'s two unselected fields (`C-3` authorization predicate, `C-7` audit disposition) are the *same class* of PA-only content, they are consolidated into this one request so that a single dated act can discharge both gates' outstanding fields. Consolidation is for the PA's convenience only: it **does not** merge the gates. `R2` still becomes effective only after `R1` is effective, and the act must say so.

## 2. Completion sweep performed this pass

Every source below was read this pass. "No value" means: no Reports tenant value, no Reports owner value, and no express F-3-reuse direction.

| # | Source | Read | Result relevant to `U-1`…`U-5` |
|---|---|---|---|
| 1 | `IIPS_v3.0_REPORTS_NP06_R1_PA_DECISION_2026-10-25.md` (the selection) | on `main` | Selects Option B; names U-1…U-5 as unresolved; **supplies no value** |
| 2 | `IIPS_v3.0_REPORTS_NP06_R1_R2_R3_PA_DECISION_REQUEST_2026-10-25.md` | on `main` | States the Option B field requirements and their consequences; **supplies no value** |
| 3 | `IIPS_v3.0_REPORTS_NP06_R2_CONTRACT_DECISION_PREPARED_2026-10-25.md` | on `main` | `C-2`/`C-4` prepared only; `C-3`/`C-7` **unresolved, no selection exists** |
| 4 | `IIPS_v3.0_GATE_B_REPORTS_OWNERSHIP_SOURCE_AND_CONTRACT_SHAPE_PA_DECISION_REQUEST_2026-10-13.md` | on `main` | Original R1.1–R1.4 ask; §4.1 `P-A4`/§4.2 `P-B2`–`P-B3` state what a complete answer must contain; **supplies no value** |
| 5 | `IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md` §5 | on `main` | The Reports-specific fifteen-element matrix: 3 established, 2 partial, 2 structural/negative-only, **8 unresolved** (2, 4, 5, 6, 7, 8, 13, 15). Element 1/3 rows describe the **F-3** pair as source — an Option A shape that the PA did **not** select; under Option B they are supplied by the new declaration |
| 6 | `IIPS_v3.0_GATE_B_REPORTS_OPTION_C_DEFERRAL_PA_DECISION_2026-10-13.md` (`REG-11` Option C) | on `main` | §2(1)–(5) operative; §2(2) **bars** copying/aliasing the F-3 pair without "an explicitly authorized, evidence-backed identity/security contract" |
| 7 | Qualified-tip governance `docs/integration/IIPS_v3.0_NP06_REPORTS_GOVERNANCE_DECISIONS.md` at `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` | **re-fetched this pass** (`git fetch … --depth=1`, objects only) | `R2`/`C4`: ownership key `(tenantId, userId)` from the **authenticated application principal**; §7 records that Reports implementation authority "remains WITHHELD". A value-pattern scan of the whole document returns **no** candidate identifier. **No value.** |
| 8 | Effective F-3 regime (`IIPS_v3.0_OWNER_CONTEXT_*`; tracker §2 `REG-10`) | on `main` | `(irr-domain-4b82d6e1, owner-7f3a91c2)`, "partition semantics only — never an authorization credential", scope **NP-09/10/11 only**; Reports expressly excluded and held at `503` |
| 9 | IPD-locus `CAP03-P02` identity determination (`principal_label`/`tenantId`/`canonicalOwnerId` = `ramki-personal-local` / `ipd-personal-local` / `ipd-owner-ramki-personal`) | tracker §16.95–§16.99 citation of the published IPD act | Records **IPD-owned** strings for the IPD application; expressly **rejects** the IRR F-3 pair and creates **no IRR↔IPD equivalence**. Not a Reports determination (see §4 option `V-3` for the consequence) |
| 10 | `IIPS_v3.0_GATE_C_S5A_DP1_OPTION_1A_PRIME_BINDING_CONTRACT_AND_PREREQUISITE_SPECIFICATION_2026-10-13.md` | on `main` | Contains the only **complete** fifteen-element `D-2` §8 contract located in the corpus — for the **Portfolios/G24** boundary, with identity-bearing parameter values reserved. Reusable as an **element template**; supplies **no** Reports element determination |
| 11 | `REG-11` row in the tracker (§2) | on `main` | Records Option C operative, `R1` NOT ESTABLISHED, 8/15 elements unresolved. This pass adds a dated annotation for the now-effective `R3` and leaves `R1`/`R2` as stated |
| 12 | Current code: `frontend/server/reports/*`, `reports-transport.ts`, `owner-context-*.ts` | read, blob-hashed | Fence `98147054…`; the binding takes an explicit owner pair and derives nothing; **no** resolver, carrier, or owner constant exists for Reports; **0** `IIPS_REPORTS*` identifiers in the tree |

**Finding (a finding, not a decision):** `U-1`…`U-5` and `C-3`/`C-7` remain **UNSUPPLIED**. Nothing located this pass narrows or widens the earlier finding, and nothing was invented, aliased, or inferred.

## 3. The seven fields, precisely

Each row states the field, its state, exactly what the PA would supply to discharge it, and the consequence of leaving it open. **No field is pre-filled.**

### `U-1` — Reports tenant value

| | |
|---|---|
| State | **UNSPECIFIED** in every authoritative record (sweep rows 1–12) |
| The PA supplies | One literal string, exactly as it must appear on disk, *or* an express statement that the tenant dimension is not used for Reports |
| If open | No carrier file can exist; no canonical bytes, no integrity digest, no value act; `R1` stays NOT ESTABLISHED |
| Consequence of a chosen value | The paired value becomes the Reports partition key in the NP-04 artifact store. It is **not** a credential and carries no authorization semantics. Changing it later requires a new PA act **plus** governed data reconciliation (the F-1/F-2 discipline) |

### `U-2` — Reports owner value

| | |
|---|---|
| State | **UNSPECIFIED**, same sweep |
| The PA supplies | One literal string (`userId` of the `(tenantId, userId)` pair), *or* an express statement that the pair reuses designated existing values per `U-3` |
| If open | As `U-1`: no declaration, no digest, no effectiveness |
| Consequence of a chosen value | Immutable per artifact; ownership is captured at write time and never client-supplied (E-2, §5) |

### `U-3` — whether the F-3 values are to be reused

| | |
|---|---|
| State | **NOT STATED.** Option B's own definition and `REG-11` Option C §2(2) make silence **non-approval**; the F-3 pair may not be copied or aliased into Reports `(tenantId, userId)` absent an express act with its scope consequence |
| The PA supplies | Either "the F-3 pair is **not** reused" (the default reading of the current records), or one express sentence reusing `(irr-domain-4b82d6e1, owner-7f3a91c2)` **and** stating that the F-2/F-1 scope consequence is accepted — namely that the F-2 value then serves a second, artifact-store boundary |
| If open | The `U-1`/`U-2` blanks cannot be filled by inference. The four options in §4 are the bounded ways to close this |

### `U-4` — the fifteen `D-2` §8 elements for Reports

Under Option B the element list is the canonical `D-2` §8 list. Two elements are already supplied by the rendered `R3` act and are **not** asked again; thirteen require the PA's statement (or an express deferral of a *named* element).

| # | Element | State after `R3` (verified this pass) | What the PA supplies |
|---|---|---|---|
| 1 | Source authority | **Supplied by the Option B act itself** — the Reports declaration is the source authority, once the act is effective | Confirm that the new declaration *is* the source authority for Reports (one sentence) |
| 2 | Target authority | **NOT ESTABLISHED** — no located instrument owns the artifact store's `AuthenticatedOwner` semantics | Name the target authority, *or* expressly determine that the PA's declaration act itself designates the target lineage `2e11fa3b…` as the Reports target authority for non-production use |
| 3 | Source identifier | **Supplied by `U-1`/`U-2`** | — (no separate answer) |
| 4 | Target identifier | **UNDECIDED / CONFLICTING if aliased** | State the target-side identifier form (for example: "identical to the source pair" is a determination that must be *stated*, not assumed) |
| 5 | Mapping lifecycle | **NOT CREATED** | State that no mapping lifecycle exists (fixed 1:1 identity), *or* name the lifecycle states |
| 6 | Provisioning authority | **NOT ESTABLISHED** | Name who may install/alter the carrier (for example: operator-only, offline, by hand) |
| 7 | Revocation authority | **NOT ESTABLISHED** | Name who may revoke, and what revocation means (carrier removal → `503` is the fail-closed default) |
| 8 | Tenant boundary | **UNRESOLVED** | Confirm exactly one tenant value, and that ambiguity is never guessed |
| 9 | Ownership boundary | **PARTIAL** — enforcement proven; semantics undefined | State the semantic: the pair is a governed partition key, not a principal |
| 10 | Authorization boundary | **PROVEN as a negative** | State affirmatively: the pair carries **no** authorization semantics (and see `C-3`) |
| 11 | Audit requirements | **PARTIAL** | Name the audit requirement for establishment/change (see `C-7` for the request-time audit) |
| 12 | Failure behaviour | **DECIDED** — `503 owner-context-unavailable`, no data read or changed | — (no answer needed; preserved) |
| 13 | Security / trust model | **NOT ESTABLISHED** — blocked by element 2 | State the trust model: no credential, no principal, no client-supplied identity is ever authoritative |
| 14 | Durable storage | **ADVANCED by the `R3` act** — server-owned `IIPS_NP04_DATABASE_PATH`, distinct from the Gate 3 store, never client-supplied, fail-closed when unset | Confirm the deployment-time path is the operator's (no value is needed for `R1` effectiveness) |
| 15 | Package / API contract | **PARTLY SUPPLIED by the `R3` act** — second specifier `iips-np04-governed-persistence#2e11fa3b…` consuming `…/persistence`; primary pin and exports unchanged | The Reports **HTTP** API contract remains `R2`'s (`C-2`…`C-9`); no answer needed for `R1` beyond confirming the persistence surface |

If the PA prefers not to determine a named element now, the act may say so **expressly** ("element *n* remains undecided"); that is a complete answer for `U-4`. Silence is not.

### `U-5` — value-act property set for the new declaration

| Property | The PA supplies | Consequence if left to inference |
|---|---|---|
| Recording location | The carrier mechanism `(a)`/`(b)`/`(c)` from §5, and its path or environment name | A carrier cannot be created; no canonical bytes, no digest |
| Change authority | Who may change the values, and whether a change is a new PA act | An unowned value is an unauditable one |
| Restart stability | Confirm the value is read per request and survives process restart unchanged | Restart behaviour would become an assumption (F-7 depends on it) |
| Recovery behaviour | What happens after partial corruption or a missing file | Silence would be read as "repair", which is inference |
| Unreadable-source behaviour | Confirm fail-closed `503`, never a default, never a fallback owner | Any other reading changes a security control |
| Audit trail | The record produced on read failure and on change (see `C-7`) | Silent failures are unjustifiable in an artifact store |

### `C-3` — authorization predicate replacing the `viewer/analyst/admin` role gate (`R2`)

| | |
|---|---|
| State | **NO SELECTION EXISTS** anywhere. Recorded as "the largest unresolved security question in `R2`". A security predicate may not be invented |
| The PA supplies | Exactly one of `P-1` or `P-2` (§6) |
| If open | `R2` cannot be rendered, therefore no transport may be implemented, therefore `F-7`'s durable HTTP leg cannot be built. This field alone blocks the whole downstream chain |

### `C-7` — audit disposition (`R2`)

| | |
|---|---|
| State | **NO SELECTION EXISTS.** The historical deny/allow audit came from the retired executor primitives; with no executor there is no audit primitive |
| The PA supplies | Exactly one of `A-1`, `A-2`, `A-3` (§7). Silent dropping is prohibited |
| If open | As `C-3`: `R2` cannot be rendered |

## 4. `U-1`/`U-2`/`U-3` — the bounded value options

Stated as options with consequences. **No option is selected, and no recommendation is enacted here.**

| Option | Content | Consequence |
|---|---|---|
| **`V-1` — new Reports-specific values** | The PA states two new literals distinct from the F-3 pair and from the IPD `CAP03-P02` strings | Cleanest scope separation: no F-2/F-1 scope extension, no IRR↔IPD equivalence. Cost: a second ownership declaration in one application, with its own value act, failure mode, and audit trail (the "two regimes" cost already stated in the 2026-10-13 request §4.2) |
| **`V-2` — express F-3 reuse** | The PA states that `(irr-domain-4b82d6e1, owner-7f3a91c2)` serve Reports too, and accepts the scope consequence | One declaration instead of two; but the F-2 value then spans a second boundary, and the act must say so expressly. `REG-11` Option C §2(2) permits this **only** through such an express, evidence-backed statement — never by silence |
| **`V-3` — reuse of the IPD `CAP03-P02` strings** | The PA designates `ipd-personal-local` / `ipd-owner-ramki-personal` (or fresh strings in that style) for IRR Reports | Creates an IRR↔IPD textual equivalence that the `CAP03-P02` determination expressly did **not** create; would need an express cross-locus statement. No such equivalence exists today |
| **`V-4` — no value (retain deferral)** | The PA declines to supply values, leaving Option C operative | Coherent and zero-risk; the commissioned and now-integrated domain/binding stays permanently unreachable; `F-7`, acceptance, `CV-51`, and admission do not advance |

Test fixtures are **not** candidate values: the owner pairs in `frontend/server/reports/reports-persistence-integration.test.ts` (`test-tenant-r3` / `test-owner-r3`, `test-owner-foreign`) and the historical fixture symbols (`tenant-A`/`user-a` era) are test data by construction and are barred from use as declarations.

## 5. `U-5` recording location — carrier mechanism options

| Option | Content | Consequence |
|---|---|---|
| **`(a)` separate server-owned carrier file + env seam** | A Reports-only path variable (name to be fixed by the act) naming a JSON file holding the pair, read per request, uncached, integrity-pinned | Reuses the *mechanism* proven by F-3 (M-1…M-7) without sharing its *values* or its file; auditable; fails closed. Adds one file the operator must install and one digest the act must record |
| **`(b)` environment-pinned constants, no file** | The pair is supplied by two environment variables read at start-up | No file to corrupt or pin; but no integrity digest, and process-environment changes become the change path |
| **`(c)` another named source** | The PA names it | Unbounded until named |

## 6. `C-3` authorization predicate — options

| Option | Content | Consequence |
|---|---|---|
| **`P-1` — no separate authorization step** | The single declared owner reaches all five operations (`context`, `create`, `read`, `appendVersion`, `supersession`) | Simplest and truthful for a single-user product: there is one owner, so an authorization matrix over it is vacuous. But it **retires** a security control by express decision — which is why only the PA may do it — and NP-06 §5.4 rows 1–3 must be superseded by express replacement rows |
| **`P-2` — non-role predicate bound to the declared owner** | Every operation asserts `requestedOwner === declaredOwner` before dispatch; failure → `404` (non-disclosure) rather than `403` | Preserves an explicit ownership check that is testable and auditable. Cost: a check that is tautological while exactly one owner exists, plus a decision about the failure verb |
| **(`P-3` — any option reintroducing roles)** | Not available | Roles presuppose principals; the baseline has none and the commissioning forbids re-introducing the authentication architecture under a Reports label |

Under either `P-1` or `P-2`, the `R2` act must also supersede NP-06 §5.4 rows 1–3 (`401` unauthenticated, `403` foreign tenant, and the authenticated-principal authorization row) with **stated** replacements, together with the prepared `C-2` (`401` retired; owner resolution failure → `503 owner-context-unavailable`) and `C-4` (all client-supplied tenant/identity claims → `400`).

## 7. `C-7` audit disposition — options

| Option | Content | Consequence |
|---|---|---|
| **`A-1` — named replacement audit sink** | The PA names the sink (for example a server-side append-only log under the server-owned data domain, with a stated record shape) | Preserves a request-time deny/allow record without the retired executor. Requires a storage decision and an F-7-visible location |
| **`A-2` — express deferral of the NP-06 §5.4 audit sentence** | The act states that request-time audit is not required for the single-owner non-production baseline, and says which records replace it (fence/`503` evidence, integration-test evidence) | Honest and minimal; but the §5.4 audit sentence is then **deferred by act**, never silently dropped, and the deferral must be visible in `F-7`'s evidence |
| **`A-3` — PA names another disposition** | Unbounded until named | |

## 8. The exact act that would close this request

One dated PA instrument, published to `refs/heads/main` and independently read back, stating:

1. **`U-1`/`U-2`/`U-3`** — one of `V-1`…`V-4` (§4), with the literal values if `V-1`/`V-2`/`V-3`, and the scope consequence if `V-2`/`V-3`.
2. **`U-4`** — a disposition for each of elements 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15 (§3), each either determined or expressly deferred by name; elements 3, 12, 14 need no answer.
3. **`U-5`** — the six properties (§3), including the carrier mechanism `(a)`/`(b)`/`(c)` (§5) and the integrity-pin discipline if `(a)`.
4. **The affirmative statements already fixed by the selection** — the pair carries no authorization semantics; no client-supplied identity is ever authoritative; failure is `503 owner-context-unavailable`; the pair is immutable, and a change is a new PA act plus governed data reconciliation.
5. **The express supersession statements** — that, for the non-auth baseline only, the act supersedes (i) the operative effect of `REG-11` Option C §2(1)–(5) as applied to Reports, and (ii) NP-06 `R2`/`C4`'s authenticated-principal precondition and §5.4 rows 1–3, by the replacement rows the same act states.
6. **`C-3`** — `P-1` or `P-2` (§6), and **`C-7`** — `A-1` or `A-2` (§7).
7. **An express confirmation that the act does not** lift or edit the fence, mount `/reports`, add a route, navigation entry, API client or UI, activate any runtime behaviour, admit a capability, or grant production admission — and that route wiring additionally requires `F-7` and capability acceptance.

`R1` becomes effective when items 1–3 and 4–5 are published and read back. `R2` becomes effective on the same publication **only** if items 6 are also present, and only after `R1` is effective; otherwise `R2` stays unrendered and this request is re-put for `C-3`/`C-7` alone.

## 9. What is prohibited until that act is effective

Unchanged from the commissioning §3 and the `R2` prepared record: no owner resolver or carrier; no transport or fence change; no route, UI, navigation, or client; no D115/`CV-43` wiring; no `F-7` claim; no acceptance; no admission or deployment; no invented value or aliased pair. The `503` fence (blob `98147054…`) remains the only Reports HTTP behaviour.

## 10. What proceeds without it

Only what has already been done or is bookkeeping: the `R3` persistence binding (effective and integrated), its real-store integration evidence, the separate-process fence evidence, this request, and the tracker reconciliation. No dependent implementation was performed in this pass.

---

*Prepared by Arena Agent Mode — investigation, verification, and decision-input preparation only. Program Authority: Ramki. **No decision rendered; no field filled. `R1` remains SELECTED — NOT EFFECTIVE / NOT ESTABLISHED; `R2` unbound; fence stands.***
