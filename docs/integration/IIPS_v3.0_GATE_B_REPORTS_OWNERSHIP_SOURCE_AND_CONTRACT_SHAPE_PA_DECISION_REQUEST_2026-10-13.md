# IIPS v3.0 — Gate B Reports Ownership Source (R1) and Contract Shape (R2) — Program Authority Decision Request

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG11-GATE-B-R1-R2-PA-DECISION-REQUEST-2026-10-13-01` |
| Record type | **Decision-request document.** Prepares an explicit decision for the Program Authority. It renders **no** decision, selects **no** option, creates **no** contract, and grants **no** implementation, admission, mapping, or activation authority. |
| Date | 2026-10-13 (UTC) |
| Decision status | **PA CHOICE = PENDING.** Nothing in this document is operative, approved, or effective. |
| Decision owner | **Ramki** — Program Authority / application owner of the single-user personal-use IIPS platform. |
| Repository / branch | `ramkivs/iips-review-recovered` `refs/heads/main` at `a280712fc00ab64f8751524144f61cdf2f82e47f` (PR #79 merge) — re-verified live 2026-10-13. |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not accessed for writes, not modified**; refs re-verified (`main` `4d3e1cdca3a33da0ec3be8b336b17128108a502c`; pin `np04-governed-persistence-windows` `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; G24 branches `arena/01a0e6d9-iips-production-market-data` and `arena/01a0f308-iips-production-market-data` both `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4`; act branch `arena/01a0f839-iips-production-market-data` `12c480b5bf5cfbe0f296fcd12c9189328b915417`). |
| Predecessor records (reused, not repeated) | [`IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md`](IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_INVESTIGATION_2026-10-13.md) (PR #79); [`IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md`](IIPS_v3.0_AD20_PERSISTENCE_LINEAGE_IDENTITY_CONTRACT_DECISION_2026-10-13.md) (PR #78, `AD-20`); [`IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md`](IIPS_v3.0_GATE_B_REPORTS_OWNER_BINDING_AND_AUTHORITY_DECISION_INPUT_2026-10-13.md) (PR #80, `NOT DECISION-READY`). |
| Canonical tracker | [`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`](../../IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md) §8, §9, §10 |
| Change boundary | Documentation only. No code, test, package, pin, lockfile, persistence, schema, route, UI, runtime-configuration, or IPD change is authorized or made. |
| Environment | Non-production. Production is out of scope. |

> **Purpose of this document.** Gate B is blocked on two inputs that only the Program Authority can supply: **R1** (ownership-source authority for the Reports target) and **R2** (contract shape). This document states the exact decision requested, presents the evidence and the three bounded options with their prerequisites and consequences, and separates technical feasibility from governance authorization. **The PA's choice is PENDING; no option is recommended as operative and none may be treated as selected until the PA records it.**

---

## 1. The exact decision requested

**Decision requested (Gate B, `REG-11`):** resolve R1 and R2 for Governed Reports, choosing **one** of the three bounded options in §4 and, for the chosen option, recording the specific authority determinations in §5. The decision is recorded by the Program Authority in a PA-authorized instrument; this document does not record it.

### 1.1 R1 — Ownership-source determination (four explicit sub-questions)

| # | Question the PA is asked to determine | Why it is required |
|---|---|---|
| **R1.1** | Does **any existing authority** — IRR-side or IPD-side — establish the ownership contract and ownership-source class of the Reports target (the artifact/report store's `AuthenticatedOwner (tenantId, userId)`)? If yes, name the instrument. If no, record that it is **not established**. | The D-2 §8 contract must name a **target authority**; none is currently identified (§3.1). |
| **R1.2** | May the Reports target's ownership pair lawfully be supplied by a **PA-governed non-authentication declaration** (class C1), given that the store documents its ownership as originating from "the authenticated principal established by the identity authority" and the current baseline has no authentication? If yes, state the instrument that establishes this and its limits; if the determination is IPD-side, state that separately (this repository does not act in IPD). | This is the security-semantics question that blocks any binding (§3.4). |
| **R1.3** | Does the governed F-2 tenant value `irr-domain-4b82d6e1` — established as a partition dimension "of this application's journal-regime data only" — extend to the artifact/report boundary? If yes, state the scope extension; if no, state whether a separate Reports tenant value and value act are required. | Only relevant to Option A; without this, A's tenant element cannot be completed (§4.1). |
| **R1.4** | If R1.1–R1.3 cannot be resolved, does Reports remain **deferred** (Option C) pending them? | Keeps the fail-closed posture an explicit choice rather than a default. |

### 1.2 R2 — Contract-shape choice

Choose exactly one: **A** (bind an existing governed identity pair), **B** (establish a new Reports-specific declaration and value act), or **C** (retain deferral). Prerequisites and consequences for each are stated in §4. If the prerequisites for A or B are not satisfied by R1's determination, the only decision available is **C**.

### 1.3 What a complete answer would contain

A decision response is complete when it states: (i) the chosen option letter; (ii) the R1 determinations R1.1–R1.4; (iii) for the chosen option, the authority instrument that establishes each unresolved D-2 §8 element (or an explicit statement that a named element remains undecided); and (iv) an explicit confirmation that no Reports route, UI, pin admission, or runtime behaviour is activated by the decision. **Until such a response is recorded, Gate B remains open and the `503` fence stands.**

---

## 2. Verified baseline and evidence discipline

### 2.1 Executed this session

| Check | Method | Result |
|---|---|---|
| IRR worktree / branch | `git status --short --branch` | Clean; branch `arena/a2729fa4-iips-review-recovered`; HEAD `118602db9b86a85f6a2ab86fdef3e733bab5d7d1`. |
| IRR authoritative ref | `gh api …/git/ref/heads/main` | `a280712fc00ab64f8751524144f61cdf2f82e47f` — unchanged since the PR #80 baseline. |
| PR #80 lifecycle | `gh pr view 80` | **`OPEN`**, `mergedAt: null`, `mergeCommit: null`; files = the decision-input record + tracker only. **Preserved; not merged, not modified by this document.** |
| Open PRs | `gh pr list` (both repositories) | IRR: only PR #80. IPD: none. |
| IPD refs | `git ls-remote` | Unchanged (§header). |
| Evidence cited in §3 | Direct reads at IRR `main@a280712` and at the exact IPD commits named in the header | Files and records listed in §2.2. |

### 2.2 Reused without re-execution

The PR #79 code-level findings (transport fences, accepted-branch tree result, PR #42 manifest, PR #51/#53 check output) and the PR #80 determinations (target-authority gap, D-2 §8 element matrix, `P1` reconciliation) are **reused** here. They remain valid at this baseline because `git diff 39d03d6 a280712 -- frontend` is **empty** and PR #80 changed no non-documentation path. This document re-read only the specific sources quoted in §3 and §4.

### 2.3 Not performed

No application tests (no application code changed); no server, HTTP request, database, environment-variable read, filesystem path resolution, or user-data inspection; no Windows/PowerShell environment; no runtime or deployment probe. **No live deployment or runtime behaviour is proven or claimed anywhere in this document.** Reports UI/no-auth-port tree inspection is **reused from PR #79**, not re-run.

---

## 3. R1 — Evidence-backed findings

Each finding cites its exact source. Classifications follow the program vocabulary (`PROVEN`, `DECIDED`, `INFERRED`, `UNPROVEN`, `CONFLICTING`, `DEFERRED`).

### 3.1 No operative Reports-side target ownership authority has been identified

**Finding: UNPROVEN / NOT ESTABLISHED.** Evidence:

1. **The consumer contract cites an authority that cannot be located.** `frontend/server/reports/persistence-port.ts` lines 40–44 declares `Np04AuthenticatedOwner { tenantId, userId }` and annotates it "Ownership pair (NP-04 `AuthenticatedOwner`; **closed decisions R2/C4**)" (blob `16d787ea77fab1b2d1d2826b9077d17eebd2fd93`). The same citation appears on the authoritative side: IPD `src/persistence/identity.ts` lines 28–41 at `2e11fa3b…` ("Per closed decisions R2 and C4, ownership is exactly (tenantId, userId)"). A bounded search of the IRR documentation tree returns only that one code comment, and **no record of `R2` or `C4` was located in either repository's examined refs**. The instrument that established the target identifier contract is therefore not retrievable from repository evidence.
2. **The target lineage carries no governance record.** A full recursive tree listing of IPD `np04-governed-persistence-windows@2e11fa3b…` contains **zero** paths under `evidence/np04`; its only carriers of ownership semantics are source and tests. By contrast the G24 portfolio line `6828155e…` carries `evidence/np04/{NP04-GOVERNANCE-AUTHORITY-RECORD, NP04-G29-…, NP04-G31-…, NP04-PROMOTION-AUTH-…, NP04-POST-PROMOTION-ACCEPTANCE-…}`.
3. **The IRR-side record disclaims the ownership position.** `docs/integration/NP-04-PERSISTENCE-DOMAIN-BOUNDARY-ACT.md` is self-labelled `ARENA TRANSFER COPY — NOT AUTHORITATIVE` with `DURABILITY STATUS: PENDING AUTHORITATIVE PUBLICATION`, and its §4.1 states: "A current NP-04 owner is **not established** by the available authoritative IRR corpus" and "A current authoritative NP-04 repository/ref is **not established** …".
4. **D-1 confers standing, not identity authority.** D-1 §1(8)–(11), §6 (`DOMAIN OWNERSHIP ≠ IDENTITY MAPPING`, `DOMAIN OWNERSHIP ≠ IMPLEMENTATION AUTHORITY`), §7 (identity boundary), §9 (package/API boundary), §12, §15.
5. **`AD-20` records the target's ownership source as an assumption, not a fact.** `AD-20` §2.1 "Known omissions / assumptions": "`(tenantId, userId)` values are **assumed** to originate from an authenticated principal established elsewhere — no such source is bound on IRR `main` for Reports"; `companyId`/`runtimeCompanyId` are explicitly **not** modelled.
6. **D-2 records the Reports identity contract as branch-local and non-equivalent.** D-2 §3.4: the Reports-transport owner value "is a pass-through of the authenticated principal **on that path only**; it is not an interface-level identity equivalence".

**Consequence for R1.1:** the target authority element of any D-2 §8 contract cannot currently be named from evidence.

### 3.2 The F-3 owner context cannot be copied directly into Reports `(tenantId, userId)`

**Finding: CONFLICTING with effective exclusions; a lawful mapping is UNPROVEN / NOT CREATED.**

1. The effective value act's equivalence exclusions: `ownerUserId` "is NOT equivalent to and NOT derived from any authenticated principal, browser/client identity, company identifier (D-2 §5), IPD `applicationUserId`, **G24/Reports `userId`**, or any other domain's owner identifier"; `tenantId` "is NOT equivalent to any IPD, G24, **Reports**, or company tenant identifier" (`IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md` §5(7)).
2. The pair's semantics: "`ownerUserId` carries **equality/partition semantics only** — no authentication or authorization semantics"; `tenantId` "is a **partition dimension only** — no tenancy, membership, entitlement, RBAC, or administrative semantics" (§5(6)).
3. The tenant dimension's scope: "Within this decision, `tenantId` is a partition dimension **of this application's journal-regime data only**" (F-2 policy §4.2(2)).
4. The governing contract rule: any cross-domain identity/tenant relationship "requires a separately governed translation contract" naming source/target authority and identifiers, mapping lifecycle, provisioning and revocation authority, tenant/ownership/authorization boundaries, audit requirements, failure behaviour, security/trust model, durable storage, and package/API contract — and "D-2 does NOT authorize that work" (D-2 §8).
5. The effective mechanism record repeats the bar: no identity may be inferred "from any request, header, cookie, browser state, session, principal, company identifier, IPD `applicationUserId`, G24/Reports `userId`, or any other domain's identifier"; any future cross-domain binding "requires a governed D-2 §8 translation contract" (§5(3), §5(7)).

**Consequence:** copying the values across would assert exactly the identity and tenancy equivalences that effective decisions deny — an unsupported security assertion, not an implementation shortcut.

### 3.3 Technical persistence fit does not establish ownership or consumer authority

**Finding: persistence-domain fit PROVEN; ownership authority and consumer admission NOT ESTABLISHED.**

1. D-1 assigns artifact/report persistence to the Artifact/Report Domain (recognizing the GovernedArtifactStore lineage) but grants no promotion, main admission, implementation, package/API reconciliation, identity mapping, or tenant mapping (§1, §§7–12, §15), and fixes the distinction vocabulary in §6.
2. The pin is physically present — `frontend/package.json` line 15: `"iips-production-market-data": "github:ramkivs/iips-production-market-data#2e11fa3b…"` — and the consumer resolves the `./persistence` subpath dynamically. **Physical presence is not authority** (the same principle is recorded in the G2-2 candidate's Q2 direction: "No authority is inferred from commit presence").
3. No Reports consumer admission exists: `AD-02` admits only `./pit` and `./d114-non-production` for five named files, requires the exact pin, and states "**Not Reports or G-2 persistence.** The Reports (`./persistence`) and G-2 admissions are unchanged by this record" (§3.3(8)). The G1-bound scope ("governed Reports persistence through `./persistence`", ACCEPTED / **BRANCH-ONLY**) is an acceptance scope, not an IRR consumer admission, and retention of the dispatch "does not extend that scope".
4. `AD-01` ratifies **presence only** for the 13 Reports paths; its operative effect is **NOT ESTABLISHED** (PR #79 §5.3; tracker §8.3), and `AD-20` §4.2(3) retains act coverage of PR #42 as **NOT ESTABLISHED**.
5. Reaching the store with any owner pair requires a **source change**: the on-`main` Reports domain accepts ownership only from an authenticated `Principal` — `frontend/server/reports/persistence.ts` line 14 ("ownership is `(tenantId, userId)` and comes only from the authenticated principal"), lines 78–85 (`principalOwner()` throws `authenticated principal is required`), lines 195–196, line 223 (`this.port.createInstance(principal, …)`) — and `frontend/server/reports/composition.ts` lines 158–170 (`ownershipFor(principal)` requires non-empty members). An adapter/mapping would therefore be an implementation act under its own gate.

**Consequence:** a technical fit plus a resolvable pin does not supply ownership, tenancy, or consumer authority. This is the separation `D-1` §6 and `AD-20` §4.4 preserve.

### 3.4 The proposed no-auth Reports model conflicts with existing authenticated-principal ownership semantics

**Finding: CONFLICTING — resolvable only by an authorized contract, not by interpretation.**

| Layer | Recorded semantics | Source |
|---|---|---|
| Artifact/report store | Ownership "is expected to originate from **the authenticated principal established by the identity authority**, never from request payloads"; the store never reads ownership from a payload | IPD `src/persistence/identity.ts` lines 28–41; `src/persistence/store.ts` lines 1–18 at `2e11fa3b…` |
| Reports domain (on `main`) | Ownership from the authenticated `Principal` only; client-supplied identity rejected; ownership mismatch refused | `reports/persistence.ts` lines 14, 78–85, 167–169, 223; `reports/composition.ts` lines 158–170 |
| Reports acceptance (D-3) | Acceptance rests on "authenticated credential → tenant resolution → resource gate with role checks → principal-derived ownership"; §7 recognizes "the Reports identity/tenant contract (principal-derived ownership, directory-resolved tenancy) within its own bounded domain" | D-3 §7, §8 |
| Program policy | No synthetic principal; "No inferred owner for principal-dependent operations … seek **a separate PA ownership/data-semantics decision** before adding a binding or migration" | Global no-auth decision §5(1), §5(5) |
| Reports disposition | Reports deferred "subject to its existing governance and admission requirements (D-3; promotion NOT EXECUTED; main admission NOT GRANTED; NP-04 store off-main)" | F-4 policy §4.4(3) |
| Failure behaviour | Fail-closed retained for every ownership failure class; any departure "requires new explicit PA authority" | F-5 policy §4.5; F-3 mechanism §5(4) |

**Consequence:** a no-auth owner-context model at this boundary is a **security-semantics change** at the target. It cannot be derived from the corpus, and it cannot be made by this repository unilaterally: the store's contract belongs to the artifact/report lineage, whose own authority record is not established (§3.1).

### 3.5 R1 evidence summary

| R1 proposition | Classification | Anchor |
|---|---|---|
| No operative Reports-side target ownership authority identified | **UNPROVEN / NOT ESTABLISHED** | §3.1 |
| F-3 pair cannot be copied into Reports `(tenantId, userId)` | **CONFLICTING**; lawful mapping **NOT CREATED** | §3.2 |
| Technical fit ≠ ownership or consumer authority | fit **PROVEN**; ownership/admission **NOT ESTABLISHED** | §3.3 |
| Proposed no-auth model conflicts with recorded authenticated-principal semantics | **CONFLICTING / DECIDED-by-policy-blocked** | §3.4 |

---

## 4. R2 — Options with prerequisites, consequences, unresolved dependencies, and preserved constraints

### 4.1 Option A — Bind an existing governed identity pair (the accepted F-1/F-2 declaration)

| Aspect | Content |
|---|---|
| **Meaning** | A PA-governed Reports binding act states that the Reports consumer's owner pair is the accepted F-1 value (`owner-7f3a91c2`) and F-2 value (`irr-domain-4b82d6e1`), **by identity mapping under a Reports-specific D-2 §8 contract** — not by field aliasing, textual copying, or inferred equivalence. |
| **Prerequisites (all required)** | **P-A1** R1.1: a located instrument, or a new explicit PA determination, that establishes the target ownership contract and its source class. **P-A2** R1.2: an authorized determination that a PA-governed non-auth declaration may lawfully supply `AuthenticatedOwner` at that boundary (or a stated alternative lawful target regime). **P-A3** R1.3: authorization that the F-2 value's scope extends to the artifact/report boundary — or a decision that a separate Reports tenant value/act is required (which converts A toward B). **P-A4** the binding act states **all fifteen D-2 §8 elements** (source/target authority and identifiers; mapping lifecycle; provisioning authority; revocation authority; tenant, ownership and authorization boundaries; audit requirements; failure behaviour; security/trust model; durable storage; package/API contract). **P-A5** affirmative statements: the pair carries no authorization semantics; no client-supplied identity is ever authoritative; fail-closed behaviour is preserved (F-5). **P-A6** R3 decided before any runtime enablement. |
| **Consequences** | No new owner/tenant values are created; consistent with the program's single application-level ownership fact (F-4 §4.4(1)) and class-C1-only rule (F-1 §4.1(1)) — which is why A is the shape F-4(1) already anticipates. It **extends the artifact/report store's ownership semantics** from principal-derived to governed-declaration-derived, a boundary security change that requires P-A1/P-A2 and is not confined to Reports. An adapter at the Reports persistence boundary remains an implementation act under a separate gate, and F-7 qualification (incl. separate-process durability) remains required per capability. |
| **Unresolved dependencies** | P-A1, P-A2, P-A3 (R1); the fifteen-element contract text (R2); R3; R4; separate implementation-authorization gate; F-7 evidence. |
| **Constraints remaining in force** | Value immutability (any change = new PA act **plus** separately governed data reconciliation); no inference from any principal/identifier; no synthetic principal; no authentication/OIDC/RBAC introduction; fail-closed `503` retained; non-production; Gate A (persistence convergence) and Gate C (Portfolios) untouched and not advanced by implication; no IPD-side action from this repository. |

### 4.2 Option B — Establish a new Reports-specific declaration and value act

| Aspect | Content |
|---|---|
| **Meaning** | The PA authorizes **new** Reports-specific ownership/security semantics: a new governed declaration (new owner and tenant values) with its own D-2 §8 contract, explicit target-authority determination, and the F-3 property set applied to the new declaration (recording location, change authority, restart stability, recovery behaviour, unreadable-source behaviour, audit/evidence trail). |
| **Prerequisites (all required)** | **P-B1** R1.1/P-A1 — **B does not avoid the target-authority question**; the boundary's ownership-source semantics still require a located or newly created authority determination. **P-B2** PA authority to create new Reports ownership/security semantics **and** to select/authorize new values (a value act of the same class as, but separate from, the F-1/F-2 act) — or an explicit amendment of F-4(1)'s single-declaration framing. **P-B3** the fifteen-element D-2 §8 contract, plus an explicit statement of the relationship between the new pair and the existing F-1/F-2 pair (non-equivalence; no reuse of removed-fixture values or of test-fixture symbols). **P-B4** affirmative statements as in P-A5. **P-B5** R3 decided before any runtime enablement. |
| **Consequences** | Creates a **second governed ownership declaration** alongside F-1/F-2 — i.e. two owner-context regimes in one application, which must be expressly reconciled with F-4(1)'s framing; carries the same target-boundary security-semantics change as A (so it does not reduce the R1 burden); requires its own value-selection act and data-safety discipline; and doubles the F-3/F-7 evidentiary surface (each declaration independently qualified per capability). It does, however, avoid extending the F-2 journal-regime value's scope. |
| **Unresolved dependencies** | P-B1 (R1); P-B2 (authority + value act); the contract and pair-relationship text (R2); R3; R4; implementation gate; F-7 evidence. |
| **Constraints remaining in force** | All constraints listed for Option A (value discipline, no identity inference, no synthetic principal, `503` retention, non-production, Gate A/C untouched), plus: no reuse of removed-fixture values (`admin-a`/`tenant-A` era), and the existing test fixtures in `frontend/server/reports/*.test.ts` (`tenant-A`/`user-a`) are fixtures, not candidate values. |

### 4.3 Option C — Retain deferral

| Aspect | Content |
|---|---|
| **Meaning** | Reports remains deferred and unavailable; R1 and R2 are recorded as open; the fail-closed fence continues to be the operative state, as it is today. |
| **Prerequisites** | **None.** This option requires no new semantics and creates no assertion. |
| **Consequences** | State fully preserved: no mapping, no contract, no value, no admission; Gate B stays open; the `503 owner-context-unavailable` guarantee remains demonstrable and unchanged. No capability is lost relative to today, because no Reports operation is available today. R1.1–R1.3 and R2–R4 remain unanswered, so this option defers rather than resolves. |
| **Unresolved dependencies** | R1.1–R1.3, R2 (still to be chosen later), R3, R4, implementation gate, F-7 evidence. |
| **Constraints remaining in force** | Every constraint in §9 — and nothing is relaxed. |

### 4.4 Option comparison (prerequisite-driven, not preference-driven)

| Criterion | A | B | C |
|---|---|---|---|
| Requires a located/created target authority (R1.1) | Yes | Yes | No |
| Creates new identity/security semantics | Yes (at the target boundary) | Yes (new declaration **and** target boundary) | No |
| Requires new values / value act | No | Yes | No |
| Extends the F-2 journal-regime value's scope | Yes (unless R1.3 splits it out) | No | n/a |
| Consistent with F-4(1) single-declaration framing as written | Yes | Only with an express reconciliation/amendment | Yes (no change) |
| Requires R3 before enablement | Yes | Yes | n/a |
| Changes the current fail-closed state | No (only after later gates) | No (only after later gates) | No |
| Verdict on evidence alone | **Prerequisites unestablished (P-A1/P-A2/P-A3)** | **Prerequisites unestablished (P-B1/P-B2)** | **Available now** |

**Statement required by the task's constraint:** neither A nor B is recommended as supported by current source evidence, because their decisive prerequisites (a located or explicitly created target authority; an authorized non-auth ownership-source class; an authorized scope for the F-2 value, for A) are **not** established. On the evidence as it stands, the only option whose prerequisites are satisfied is **C**. A or B become available **only if** the PA's R1 determination supplies their prerequisites — in which case the option set should be re-read against that determination. **This document does not select C either; the choice is the PA's and remains PENDING.**

---

## 5. Authority required, per option

| Option | Authority instrument required | Who can render it | Notes |
|---|---|---|---|
| **A** | (i) An ownership-source/authority determination for the Reports ↔ artifact/report boundary (IPD-side act **or** an explicit IRR PA determination of record naming the instrument and its limits); (ii) a PA Reports binding act containing the full D-2 §8 element set; (iii) if the F-2 value is to be used at that boundary, a scope-extension determination (or a new value act). | Ramki (IRR PA). If (i) must come from the target lineage's own authority, it is an **IPD-side act** — separately governed, and **not performed by this repository**. | The standing authorization for the F-3 workstream does **not** cover opening a deferred capability; F-4 and the effective F-3 mechanism record expressly defer Reports and forbid its implementation, admission, or enablement without their own explicit authority. |
| **B** | (i) As in A(i); (ii) PA authority to create new Reports ownership/security semantics; (iii) a new value act (owner + tenant) establishing the new declaration; (iv) a PA binding act with the full element set plus the pair-relationship statement. | Ramki (IRR PA), with A(i) resolved on whichever side it belongs. | Carries the same target-boundary determination as A and adds a value-selection act; the F-3 mechanism record recorded that value-selection authority was **not** exercised there and that a change to the existing pair requires a new PA act **plus** separately governed data reconciliation. |
| **C** | No new instrument required; the existing deferral already operates. | — | Should the PA select C, the only artifact needed is the PA's recorded confirmation; no contract text is required. |

**Authority gap restated:** the current standing authorization is bounded to its established scope and forbids unrelated scope expansion; F-4 defers Reports; the global no-auth policy requires a **separate PA ownership/data-semantics decision** before any binding is added; and `AD-20` §4.3 defines Gate B as requiring its own explicit PA gate. Therefore **none** of A, B, or C is currently forced by existing authority — A and B additionally require authority that does not exist yet, and C requires only confirmation. That is precisely why an explicit PA input is the next step.

---

## 6. Technical feasibility versus governance authorization

| Technical fact | Technical classification | Governance status |
|---|---|---|
| `OwnerContext {tenantId, ownerUserId}` and `AuthenticatedOwner {tenantId, userId}` are structurally compatible shapes | **PROVEN (types)** | **NOT AUTHORIZED** — value act §5(7); D-2 §8. Type compatibility is not identity. |
| The artifact store accepts any non-empty string members (`assertOwner` rejects only empty/non-string) | **PROVEN** | Validation behaviour is **not** authority; using it to accept a non-principal pair requires the R1.2 determination. |
| The Reports domain on `main` accepts ownership only from an authenticated `Principal` | **PROVEN** | Reaching the store with a declaration-derived pair requires a **source change** under a separate implementation gate. |
| A server-owned non-auth declaration can be read at runtime on this platform (the F-3 carrier proves the mechanism) | **PROVEN for NP-09/10/11** | **No Reports authority**; F-4/F-3 records keep Reports deferred; F-7 qualification unmet. |
| The pin resolves and exposes `./persistence` | **PROVEN at `2e11fa3b…`** | **R3 — not admitted** for Reports (`AD-02` §3.3(8); `AD-01` presence-only, effect not established). |
| Persistence domain is designated for artifact/report data | **PROVEN (D-1)** | Domain designation only; `DOMAIN OWNERSHIP ≠ IDENTITY MAPPING ≠ IMPLEMENTATION AUTHORITY` (D-1 §6). |
| The proposed no-auth ownership model is implementable | **INFERRED (feasible)** | **NOT AUTHORIZED** — conflicts with recorded target semantics (§3.4) and with `F-5`/`F-4` absent an explicit act. |

**Rule applied:** an implementation assumption is not a decision. Nothing in the "feasible" column may be presented, or read, as an operative contract.

---

## 7. Worked completeness checklist for Option A (non-operative; illustration of what the act must contain)

*This table is a **blank**, non-operative checklist showing what a complete Option-A act would have to decide. It records no value, asserts no mapping, and must not be read as a draft contract or as approval. Every cell is the PA's to decide.*

| # | D-2 §8 element | What the Option-A act would have to state | Status today |
|---|---|---|---|
| 1 | Source authority | The accepted F-1/F-2 governed declaration (value act) remains the source | Established |
| 2 | Target authority | The instrument that owns the artifact/report ownership contract and its source class | **Not established — R1.1/R1.2** |
| 3 | Source identifier | The F-1 value and the F-2 value as accepted (unchanged) | Established |
| 4 | Target identifier | Whether the Reports target pair is the same identifiers by identity mapping, or a different pair | **Undecided — R2 (and R1.3 for the tenant)** |
| 5 | Mapping lifecycle | Creation, amendment, and retirement of the binding | Not created |
| 6 | Provisioning authority | Who may supply/alter the Reports owner pair | Not established |
| 7 | Revocation authority | How the binding is withdrawn and what happens to stored artifacts | Not established |
| 8 | Tenant boundary | Whether `irr-domain-4b82d6e1` governs at the artifact/report boundary | **Undecided — R1.3** |
| 9 | Ownership boundary | Owner-equality scoping (as the store already enforces) plus the new source rule | Partially decided |
| 10 | Authorization boundary | Explicit statement that the pair carries no authorization semantics | Decided (must be restated) |
| 11 | Audit requirements | Establishment/change records; consistent with F-3 property 6 | Partially decided |
| 12 | Failure behaviour | `503 owner-context-unavailable`; no data read or changed; per-route, never process-fatal | Decided (must be restated) |
| 13 | Security/trust model | Non-auth declaration trust basis; no client-supplied identity; no principal inference | **Not established — R1.2** |
| 14 | Durable storage | The declared store and its configured path regime | Structural only |
| 15 | Package/API contract | Whether and how the Reports consumer may use `./persistence` at the pin | **R3** |

---

## 8. Remaining gates that this decision does not close

| Gate | Content | Status | Notes |
|---|---|---|---|
| **R3 — Reports pin / consumer admission** | Whether the Reports boundary may consume the `./persistence` subpath of pin `2e11fa3b…`. | **Open.** | No Reports consumer admission exists: `AD-02` admits only `./pit` and `./d114-non-production` for five named files and leaves the Reports `./persistence` and G-2 admissions unchanged (§3.3(8)); `AD-01` is presence-only with operative effect **NOT ESTABLISHED**; D-1 §9 performs no package/API reconciliation and no consumer migration; D-3 §11 records implementation and promotion authority **NOT GRANTED**. The physical pin in `frontend/package.json:15` is presence, not authority. |
| **R4 — `P1` (D-1 vs PR #42)** | Whether the 2026-10-06 merge of PR #42 at `47edf6f3db79c6c443caed148121406f33a158b7` is covered by an act, or must be closed by an explicit PA disposition. | **Open — `CONFLICTING / UNRESOLVED`.** | Re-verified: the PR's own title/body required a separate promotion act ("DO NOT MERGE without promotion act"; "NOT authorized for merge"), yet it merged with **0 reviews and 0 comments**; D-1 (an ancestor of the merge) grants no promotion or main-admission authority for either lineage; act `26061859…` (re-read verbatim at its commit) covers only the G24 Phase-A lineage into `arena/01a0e6d9` and expressly withholds `main` and "Watchlists, Reports, Collaboration, Settings, Governed Screener persistence"; coverage by any other act remains **NOT ESTABLISHED**. No retrospective authorization is created or implied. |
| **Implementation-authorization gate** | Any adapter/route/UI work required after R1/R2 (and, for the boundary, after R3). | **Not authorized.** | Separate explicit PA gate; F-7 qualification follows. |
| **F-7 qualification** | Five-part per-capability bar including separate-process durability. | **NOT SATISFIED for Reports.** | Fail-closed tests alone are insufficient by F-7's own terms. |
| **Gate A / Gate C** | Persistence convergence; Portfolios identity/security contract. | **Separate; untouched.** | Gate A is **not** a Gate B prerequisite; this document resolves neither and implies nothing about either. |

---

## 9. Explicit non-authorization boundaries

This document does **not**, and may not be read as:

1. Selecting Option A, B, or C — the choice is **PENDING** with the Program Authority.
2. Creating, drafting, or rendering operative any owner-binding, translation, or D-2 §8 contract; creating or proposing any owner/tenant value; or asserting any identity, tenancy, principal, membership, or security-identifier equivalence.
3. Authorizing Reports or User Portfolios activation, enablement, routing, dispatch, UI, or admission; both remain fail-closed at `503 owner-context-unavailable`.
4. Authorizing any code, test, package, pin, lockfile, persistence, schema, journal, route, UI, deployment, or runtime-configuration change — or any `.gitignore`/`.gitattributes`/grammar change.
5. Authorizing any IPD action (no ref, branch, commit, act, record, or pin change), any merge/cherry-pick/re-pin/promotion/convergence of the two persistence lineages, or any Gate A outcome.
6. Resolving `P1`, ratifying PR #42, or creating retrospective authorization of any kind.
7. Granting qualification, acceptance, admission, promotion, main admission, or production authority.
8. Amending or reopening D-1, D-2, D-3, `F-4`–`F-7`, the F-3 records or value act, `AD-20`, the global no-auth decision, or any historical record or status banner.
9. Creating a second master tracker, or merging/bypassing PR #80 (whose lifecycle is preserved as `OPEN`).

---

## 10. Verification performed and not performed

| Check | Method | Result |
|---|---|---|
| Branch / worktree | `git status --short --branch` | Clean; `arena/a2729fa4-iips-review-recovered`; HEAD `118602d…`. |
| IRR baseline | `gh api …/git/ref/heads/main` | `a280712fc00ab64f8751524144f61cdf2f82e47f` — matches PR #79 merge; unchanged. |
| PR #80 | `gh pr view 80` | `OPEN`; `mergedAt`/`mergeCommit` null; unchanged by this document. |
| IPD refs | `git ls-remote` | Unchanged from §header; no IPD write. |
| Changed paths (this publication) | `git status --porcelain`, `git diff --stat` | This record (new) + canonical tracker §10 pointer (additive). Documentation only. |
| Relative links | Path existence check | All linked files resolve at this baseline. |
| Application tests / runtime / DB / environment / deployment | **NOT RUN** | No application code changed; no server, request, database, environment value, or deployment was accessed. **No runtime or deployment behaviour is proven.** |
| Windows / PowerShell | **NOT RUN** | No Windows environment invoked. |
| Reports UI / no-auth port | **Reused from PR #79** | Not independently re-inspected. |
| `R2`/`C4` locatability | Qualified negative | Phrase found only in the two source comments (`reports/persistence-port.ts:40`; IPD `identity.ts`); **not** an exhaustive cross-ref act inventory. |

---

## 11. Publication

- **Changed paths:** this record (new) and the canonical tracker (additive §10 pointer only). No other path.
- **Publication:** additive documentation-only commit on the session branch, published through the repository's normal PR workflow; the decision-request document is appended to the existing PR #80 lineage or raised as a follow-on PR **without merging or bypassing PR #80**. Merge is the Program Authority's act; until merge, this document has no durable effect.
- **Effect of publication:** recording a decision request only. It is not a decision, not a contract, and not an admission, and it changes no capability, no fence, and no gate status beyond making the pending choice explicit.

---

*Recording agent: Arena Agent Mode — decision preparation, evidence verification, and publication support only; no authority is rendered by the agent. Program Authority: Ramki. **PA choice: PENDING.** Prepared 2026-10-13 (UTC).*
