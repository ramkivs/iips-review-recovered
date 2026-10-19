# PKG-02E — G3-D2 PA decision registration and G3-D3…D7 / Gate 3 reconciliation

**Status:** additive IRR-side registration of the Program Authority's explicit G3-D2 decision and reconciliation of the remaining Gate 3 request. This packet is not a Gate 3 implementation-authority act and grants no implementation, qualification, result-acceptance, admission, release, or production authority. The PA decided **G3-D2 — B (`node:sqlite`) — SELECTED AND APPROVED** on 2026-10-19. No other G3-D3…D7 disposition is rendered here.

**Prepared:** 2026-10-19 UTC.

**Verified preparation bases:**

- IPD `ramkivs/iips-production-market-data` `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6`.
- IRR `ramkivs/iips-review-recovered` `main@a967a2a06b710077e26e4320f5c27c490283d43e`.

The PA decision record is `docs/integration/IIPS_v3.0_G3_D2_STORAGE_TECHNOLOGY_PA_DECISION_2026-10-19.md` (record ID `IIPS-V3-G3-D2-STORAGE-TECHNOLOGY-PA-DECISION-2026-10-19-01`). The PA's instruction was direct input to the operating session; Arena records the decision and does not make it.

---

## 1. Verify — authoritative request and previous packet

### 1.1 Live heads and source identity

Before editing, the IPD remote `main` was independently resolved with `git ls-remote`, cloned read-only at its `main` head, and read at `be32d8c95a86b3f03bd382ccde5b6398efb351c6`. IRR `origin/main` after `git fetch origin main` and `git ls-remote` was `a967a2a06b710077e26e4320f5c27c490283d43e`.

The current authoritative request is:

- IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`
- Request ID `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-REQUEST-2026-10-18-01`
- IPD request blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` at IPD `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6`.

That object ID is identical to the request blob recorded in PKG-02D. The current §§4, 9, and 13.3 retain the same G3-D2 options: **A** (`better-sqlite3`), **B** (`node:sqlite`), **C** (another identified technology), or **DEFER**. There is no material request-text change since PKG-02D. The earlier packet's `DECISION REQUIRED` status is historical and is superseded for G3-D2 only by the explicit PA decision recorded here. PKG-02D is preserved and not rewritten.

### 1.2 Prior publication and current registration state

IRR PR #141 (PKG-02D publication) and PR #142 (publication/reconciliation follow-up) are both **MERGED**. Independently checked PR metadata reports PR #141 merge commit `4ea7707b243506de195608cf17971804dd71d824` with CI `39178193044` successful, and PR #142 merge commit `a967a2a06b710077e26e4320f5c27c490283d43e` with CI `39179742184` successful. The latter is the verified IRR base for this task. Those publication-only facts do not change the new PA decision or authorize implementation.

### 1.3 Relevant governing records

| Record | Current verified location / reference | Governing effect |
|---|---|---|
| G3 implementation-authority request | IPD request above; §§2–9, 13.2–13.4, 15 | Defines current G3-D2…D7 questions, the proposed—not final—implementation plan and tests, the non-grant boundary, and the separate Gate 3 act |
| G-2 Durable User Portfolio Architectural Decision | IRR `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md`, blob `7e83946b470bcc6f4751fb1a67e832ac66128c5c` at the preparation base; especially §§1, 3, 8–10 | IPD owns the durable portfolio boundary; §3 requirements remain; technology is not prescribed by G-2; architecture direction is not implementation authority |
| Gate E write policy rev 1 (accepted) | IPD `evidence/cross-repository/IIPS_V3_G2_GATE_E_PORTFOLIO_WRITE_POLICY_2026-10-18.md`, blob `4a9501bffb49abbbc0ba5b5c4f81d2841812913e` | W-1 keeps writes refused until four separate conditions; W-3/W-4/W-11/W-12/W-13/W-16 establish transaction, atomicity, durability, recovery, lineage, audit, and retention obligations |
| Consumer contract v1.0.0 (accepted) | IPD `evidence/cross-repository/IIPS_V3_G2_IPD_IRR_PORTFOLIO_CONSUMER_CONTRACT_V1_2026-10-18.md`, blob `163eb1f18ce023bb9a06917de99ca279fdb86bf7` | Technology-neutral boundary and protocol constraints remain unchanged |
| L-IPC-1 security contract (accepted with changes) | IPD `evidence/np04/IIPS_v3.0_G2_IPD_LOCAL_PRINCIPAL_OS_IPC_SECURITY_CONTRACT_PROPOSAL_2026-10-16.md`, rev 2; accepted text blob `cab04b6f94618c9afad1440882ebf63437fdf6f8`; current file with dated notes blob `fc8d1cbc9ec96f4f93fce8afbbb659b044f6268f`; acceptance decision blob `f708630436358097c11c167d3d8ab1a6c8a54095` | Accepted with changes for one user / one personal laptop / non-production. Acceptance grants no implementation, provisioning, qualification, admission, or production authority; platform-test waivers are not technical proof. |
| G3-D0 PA disposition | IPD `evidence/cross-repository/IIPS_V3_G3_D0_DISPOSITION_2026-10-18.md`, blob `b193fbbf486de63164808edb8d8619a74e6f0203` | Re-author on IPD `main`; off-`main` lineage reference-only for the intended G3 path; no new implementation grant |
| PKG-02D | IRR `docs/integration/2026-10-18/PKG-02D-G3-D2-STORAGE-DECISION-PREPARATION.md`, blob `ef85b5cd08b7b8a50a722c6b2cb38540049520cd` | Prior decision-preparation evidence; no option was selected in that earlier record |

## 2. Record — G3-D2 only

The authoritative decision is recorded in the linked PA decision record as:

> **G3-D2 — Storage technology (CV-20(c)): OPTION B — `node:sqlite` — SELECTED AND APPROVED.**

The source is the PA's explicit instruction dated 19 October 2026. It is not an Arena recommendation. The scope is only the technology selection. This decision does **not** decide G3-D3, G3-D4, G3-D5, G3-D6, or G3-D7; it does not accept experimental status as a separate risk waiver; and it does not establish an exact runtime pin, final file set, schema, migration algorithm, write scope, or deployment behavior.

CV-20's previously designated ownership source (CV-20 Option A) is distinct from the G3-D2 storage alternatives. G3-D2 Option B leaves that ownership-source designation and all accepted G-2/Gate E terms unchanged.

## 3. Reconcile G3-D3 through G3-D7

The classifications below follow current IPD request §13.3. A factual constraint is not converted into a PA choice, and no unanswered line is invented.

### G3-D3 — Permitted write slice

**Status: Outstanding PA decision.** The exact alternatives in request §5 item 7 / §9 are:

- **3a — reads and refusal only:** no write code; every write remains refused as `WRITE_NOT_AUTHORIZED` under Gate E W-1.
- **3b — writes disabled by default:** write code may exist in the authorized file set but remains fail-closed behind all four W-1 conditions; this does not enable writes.
- **DEFER:** leaves the presence/absence of write code undecided and prevents the Gate 3 file set from being fixed.

G3-D2 does not select between 3a and 3b. W-1 is already accepted and technology-neutral: a write requires (1) accepted Gate E, (2) a Gate 3 act naming the exact repository/basis/file set/tests, (3) executed Gate 4 qualification plus a separate result-acceptance act, and (4) a Gate 5 admission act naming qualified commits and lifting the 503 for named operations. Until all four are met, writes must have zero store effect. The request's T-G must be fixed in the later Gate 3 act for the PA-selected slice.

### G3-D4 — Provisioning-code scope

**Status: Outstanding PA decision; execution is a separate, outstanding operator prerequisite.** Request §9 alternatives are **`INCLUDE CODE` / `EXCLUDE` / `DEFER`**.

This item is about whether provisioning code appears in the bounded Gate 3 scope. It is not a decision to execute provisioning. The request identifies the A-2 local-principal binding and A-3 audit line as provisioning-related concepts; it also says Gate 3 does not execute the one-time provisioning act. The request records that operator act as **APPROVED, NOT EXECUTED**. Neither G3-D2 nor any answer to G3-D4 can create a binding without the separate operator act. `INCLUDE CODE` would not itself execute the act; `EXCLUDE` would keep provisioning code out of that Gate 3 file set; `DEFER` leaves that file-set boundary unresolved.

### G3-D5 — Reference-only confirmation for the 2026-10-07 durable line

**Status: The substantive `REFERENCE ONLY` status is confirmed by existing PA decision/evidence; the request's formal one-line PA confirmation remains outstanding.**

The PA's G3-D0 disposition explicitly makes the off-`main` implementation lineage reference-only for the intended G3 path and bars promoting, merging, cherry-picking, re-pinning, or using it as the new base. The current Gate 3 request §13.3 classifies D5 as **[A]**: existing accepted records support `REFERENCE ONLY`, and no new technical evidence is needed to answer. However, that same current request expressly says formal closure of CV-20(a) still requires the PA's one-line answer in §9 (`REFERENCE ONLY` / `OTHER: …` / `DEFER`); request §15 says that line has not been rendered. The G3-D0 disposition is not silently repurposed to erase that explicit procedural requirement. Therefore CV-20(a) remains formally open until that line is rendered; no different D5 option is inferred here.

### G3-D6 — Interpretation of G-2 §3

**Status: Outstanding PA decision.** The exact alternatives in request §9 are **`CONFIRM` / `CHANGE: …` / `DEFER`**.

G-2 §3's thirteen requirements remain the accepted baseline: explicit owner/principal and tenant/company context; stable durable identity; restart durability; versioned serialization/deserialization; migration capability; lifecycle/retention; reset/deletion; concurrency/version semantics; server-side authorization; owner/tenant isolation; auditability; and contribution/lineage/idempotency preservation. G3-D6 asks how those requirements read in the approved single-user, non-production mechanism, beyond the already established owner-identity/isolation framing. The PA has not answered that question in the current task. It is not answered by choosing `node:sqlite`.

The G3 request's §5 storage/schema text is a proposal; it does not give license to invent schema columns, property names, exact migrations, a database file set, or an interpretation that drops a G-2 requirement. Until D6 is answered, those choices remain unresolved and the Gate 3 act cannot finalize the schema/audit obligations.

### G3-D7 — IRR capacity and C8

**Status: Outstanding PA decision in the IRR capacity; C8 technical evidence remains NOT MET.** Request §9 alternatives are **`ACCEPT` / `ACCEPT WITH CHANGES: …` / `DEFER`** for the §5.1 IRR scope: C8 loopback/CORS remediation, an IPC client adapter that re-enforces the named OC-7/C7 constraints and does not retry writes, and the IRR contract-version revision.

Independently re-read at IRR `main@a967a2a06b710077e26e4320f5c27c490283d43e`:

- `frontend/server/executive-transport.ts:693` sets `Access-Control-Allow-Origin: *`;
- `frontend/server/executive-transport.ts:926` calls `server.listen(port, …)` without a loopback host;
- `frontend/vite.config.ts:9` configures `host: '0.0.0.0'`;
- `frontend/server/user-portfolio/userPortfolioContract.ts` still has `G2_CONTRACT_VERSION = '2'` (blob `0dec72eb750206603196c67f6b27947420d7e6ac`);
- IRR's owner-scoped user-portfolio transport still responds with HTTP `503 owner-context-unavailable` and does not call a concrete port.

These are repository-source/configuration observations, not proof about a live Windows deployment or browser. C8 is **NOT MET**. G3-D2 is an IPD storage choice and does not resolve C8, authorize IRR changes, or lift the 503. A D7 answer would still be a scope disposition, not an implementation act.

## 4. Consolidated response-ready PA request

G3-D2 is already decided. **No reconfirmation of G3-D2 is requested.** The following single response instrument contains only outstanding lines; the D5 line is retained because the governing request requires it for formal CV-20(a) closure. For D7, the answer is in the PA's IRR capacity.

```text
I, Ramki, as Program Authority (and, for G3-D7, in the IRR capacity), decide:
G3-D3 Write slice ........................................................... 3a (reads and refusal only) / 3b (writes disabled by default) / DEFER
G3-D4 Provisioning code (execution stays a separate Gate A act) ............. INCLUDE CODE / EXCLUDE / DEFER
G3-D5 Off-main 2026-10-07 durable line (CV-20 (a)/R-8(a)) ................... REFERENCE ONLY / OTHER: ... / DEFER
G3-D6 G-2 §3 single-user reading (CV-20 (d)) ................................ CONFIRM / CHANGE: ... / DEFER
G3-D7 IRR scope in §5.1 (C8 remediation, IPC client, contract-version revision) under IRR authority ... ACCEPT / ACCEPT WITH CHANGES: ... / DEFER
This response grants no implementation, qualification, result-acceptance, admission, fence-lift, release, or production authority.
```

The D5 evidence supports the `REFERENCE ONLY` status, but the request makes the explicit answer necessary for formal closure. The PA can still select `OTHER` or `DEFER`; this packet does not select an answer for the PA.

## 5. Exact Gate 3 authorization prerequisites and readiness

### 5.1 Gate 3 request §2 prerequisite status (P1–P15)

The table separates accepted policy/preconditions from unresolved decisions and downstream host evidence. “Met” for a policy does not mean implemented or tested.

| Request ID / prerequisite | Status at this reconciliation | Evidence / boundary |
|---|---|---|
| **P1** CV-20 item (b), ownership source | **MET** — Option A; Gate 1 | Existing ownership-source designation; distinct from storage Option B |
| **P2** Gate 2 consumer contract v1.0.0 | **MET / ACCEPTED** | Accepted contract record; technology-neutral boundary |
| **P3** Gate 2 Gate E write policy rev 1 | **MET / ACCEPTED** | W-1 is fail-closed and remains binding |
| **P4** Meaning of “stop both processes” | **MET** — option (b), stop and restart both IRR and IPD | Accepted policy/precondition; later QE-4 application test remains unexecuted |
| **P5** Tenant-hint reading | **MET** — non-authoritative; IPD binding is sole tenant source | Accepted Gate 2 reading; no tenant authority from an IRR hint or wire field |
| **P6** Revoked-binding data disposition | **MET AS POLICY** | Applies to future implementation; not implemented or tested |
| **P7** CV-20 item (a), qualification-authority choice for existing durable line | **OPEN — formal PA answer required** | G3-D5 is classified [A]; G3-D0 supports `REFERENCE ONLY`, but the request still requires its explicit §9 line; no closure inferred |
| **P8** CV-20 item (c), storage technology | **RESOLVED 2026-10-19** — Option B, `node:sqlite` | PA decision record; technology selection only |
| **P9** CV-20 item (d), G-2 §3 single-user reading | **OPEN — PA-reserved** | G3-D6 `CONFIRM` / `CHANGE: …` / `DEFER` |
| **P10** Gate 3 IPD-`main` basis (CV-20 R-3) | **Principle resolved; exact pin pending** | G3-D0: re-author on `main`, off-`main` reference-only; separate act must name the exact then-current SHA |
| **P11** IRR C8 loopback/CORS posture | **NOT MET on IRR `main`** | Source/configuration findings in §3 G3-D7 reconciliation; D7 decision and any IRR work remain separate |
| **P12** Gate A provisioning on Windows host | **APPROVED, NOT EXECUTED** | Separate one-time operator act; selecting storage or deciding code scope does not execute it |
| **P13** Gate C read-only subset Q1–Q4/Q9–Q11, including C5.1/Q9 zero bytes | **NOT EXECUTED** | Read-only qualification evidence, not supplied by sandbox smoke or Gate 3 CI |
| **P14** Windows ACL/SDDL, cross-account/remote isolation, pipe-collision measurements | **TECHNICALLY UNVERIFIED; specified V-P tests PA-waived** | G3 request P14 cites CV-20 §4.9 and L-IPC-1 §9; acceptance decision §4.1 preserves the waivers. The waived measurements remain unverified and the waivers are not proof; do not relabel them PASS/FAIL/BLOCKED or treat them as waiving separate V-E requirements |
| **P15** Host preconditions (single interactive user, inbound sharing off, browser loopback under C8) | **NOT RECORDED** | L-IPC-1 U-2 / request §2; no deployment-host observation or assumption claimed |

### 5.2 Still required before a separate Gate 3 implementation-authority act is ready

1. The consolidated PA response to G3-D3, G3-D4, G3-D5, G3-D6, and G3-D7 (D7 in IRR capacity). D2 is not reopened. The D5 line is the request’s required formal PA answer for CV-20(a)/P7; G3-D0 supports `REFERENCE ONLY` substantively but does not render that line or close P7 by itself.
2. The exact IPD `main` SHA current when the separate act is rendered; `be32d8c9…` is this record's evidence baseline, **not** the future implementation pin. G3-D0 expressly disallows relying on a floating `main` label or a superseded tip.
3. The exact bounded IPD file set and tests, including any required IRR scope if D7 is accepted. Current request §3/§6 entries are proposals, not a grant. Do not infer file names beyond the source.
4. An explicit dependency decision for Option B: no third-party SQLite runtime package is inherent, but the act must state whether package metadata, lockfile, Node-version declaration, and/or type tooling change. If any change is required, it must be named in the act.
5. The exact Node runtime version or supported version policy, and the `node:sqlite` APIs the implementation will rely on. Current CI selects only the Node 22 major; the package contains no exact engine/version declaration.
6. The selected D3 write-slice restriction and D4 provisioning-code boundary; the D6 G-2 interpretation and schema/audit obligations; the D7 IRR scope and exact IRR file/test boundary if accepted.
7. Gate-3-level acceptance evidence and restrictions, as specified by the act: named commits; CI typecheck/build/guarded test run; all fixed tests pass; non-zero executed count, zero failures, recorded counts; no claim of Gate 4 qualification or Gate 5 admission.

### 5.3 Downstream operator and qualification items (not a substitute for Gate 3 decisions)

The request records the Windows Gate A provisioning act as approved but **NOT EXECUTED** and the read-only Gate C subset Q1–Q4/Q9–Q11 as **NOT EXECUTED**. Those are not evidence that Windows has been validated. Its P14 records the Windows endpoint ACL/SDDL, cross-account/remote isolation, and pipe-collision measurements as **technically unverified**; L-IPC-1's prior PA waivers make the listed V-P measurements not required, but the waivers are **not technical proof** and must not be relabeled as PASS. P15 records host preconditions as **not recorded**: one interactive user, inbound sharing off, and browser loopback under C8. Do not claim those conditions hold. Gate E §4 requires later Windows deployment-host evidence at recorded digests, including QE-4 restart persistence, QE-7 crash atomicity/migration refusal, QE-8 revocation, QE-9 no-effect refusals, and QE-10 outcome-unknown behavior. Gate 4 execution, separate result acceptance, Gate 5 admission, and any 503 lift are later, independent stages.

### 5.4 Bounded implementation area — still a proposal

The current request §3/§6 proposes, subject to the future act:

- IPD `src/persistence/*` for connection/migrations/ledger/schema/transactions;
- IPD `src/ipc/*` for same-host IPC endpoint, framing, dispatch, and refusal mapping;
- a durable adapter alongside the existing IPD portfolio port while preserving `PortfolioStorePort`, the UI session adapter, and `SESSION_ONLY` labeling;
- new tests T-A through T-J, with existing `bi07_*` tests unchanged;
- `package.json`/lockfile only if an explicit dependency/runtime/type requirement is named.

The request says `src/identity/*` stays unchanged. Exact file names and the final IRR scope are not fixed. Do not derive schemas, migration steps, protocol property names, or additional files from this proposal. The later act must state the exact file and test set; no implementation is started here.

## 6. Gate 3 versus Gate 4 evidence

The Gate 3 request §6.2 proposes T-A…T-J, including framing, caller authority refusal, binding validation, read behavior, startup failure, no network listener, the selected write-slice behavior, durability vocabulary, existing store-port tests, and continued IRR 503 behavior. The separate Gate 3 act must fix the exact test list and tie CI evidence to named commits.

Gate 3 acceptance is limited to that authorized implementation scope and CI evidence. It does **not** establish:

- Windows named-pipe permissions or collision behavior;
- successful application-level restart persistence on the deployment host;
- crash atomicity during a write;
- a clean migration ledger under tampering;
- C5.1/Q9 zero bytes on the deployment host;
- post-restart binding revocation behavior; or
- a durable portfolio capability suitable for admission.

Those remain later Gate 4 / Gate C / result-acceptance questions. The G3-D2 choice does not close them.

## 7. Preserved safeguards and scope boundaries

Verified on the current heads before editing:

| Boundary | Current value |
|---|---|
| IPD portfolio store | `SESSION_ONLY` / `durable: false`; no durable persistence or IPC implementation paths on `main` |
| IRR `/api/user-portfolios*` | Fail-closed HTTP `503 owner-context-unavailable` |
| C8 | **NOT MET** — wildcard CORS, non-loopback listen configuration, and Vite `0.0.0.0` remain in source/configuration |
| Gate 3 implementation authority | **NOT GRANTED** |
| Gate 4 qualification / result acceptance | **NOT EXECUTED / NOT ACCEPTED** |
| Gate 5 admission / 503 lift | **NOT GRANTED** |
| Production eligibility/use | **NOT AUTHORIZED** |
| Existing baselines | 51-row baseline and 13-item inventory are unchanged; neither is recounted or redefined here |
| IRR PR #114 | Unrelated and untouched |
| IPD repository | Read-only inspection only; no IPD file/ref modified |

## 8. Exact next authorized action

The next step is the PA's single consolidated response to the remaining lines in §4 of this packet. Once those answers exist, prepare a **separate** Gate 3 implementation-authority act that pins the exact current IPD `main` SHA, bounded file set, tests, dependencies, restrictions, prerequisites, and Gate-3-level acceptance evidence. Until that separate act is explicitly rendered and effective, do not implement persistence, change IRR route behavior, modify IPD runtime behavior, create an implementation PR, or claim qualification, admission, or production readiness.

## 9. Verification performed for this packet

| Check | Result | Evidence boundary |
|---|---|---|
| Live repository bases and request currency | Verified | Current IRR/IPD heads and request blob read from live remotes; current request blob equals PKG-02D source blob |
| PA decision and scope | Verified from direct PA instruction dated 2026-10-19 | G3-D2 B — `node:sqlite`; no D3-D7 answers inferred |
| G-2 and Gate E requirements | Verified | Current G-2 §3, accepted Gate E W-1/W-3/W-4/W-11/W-12/W-13/W-14/W-16 and G3 request read |
| Node.js version/stability | Verified | `nodejs/node` official docs at `v22.22.3` and `v22.5.0`; sandbox Node `v22.22.3`; `ExperimentalWarning` observed |
| `node:sqlite` API smoke | Verified, limited | Disposable sandbox file: immediate transaction, rollback, commit, close/reopen-connection read; Linux sandbox only, not application, Windows, process-restart or Gate 4 evidence |
| Runtime declaration and types | Verified | IPD CI uses Node major `22`; no `engines`/`.nvmrc`/`.node-version`; lock resolves `@types/node` `22.20.4`, whose `sqlite.d.ts` contains `DatabaseSync` |
| IRR 503, C8, and IPD SESSION_ONLY fences | Verified from source/configuration at the live heads | Source-level only; no Windows, browser, localhost application, or deployment-host test claimed |
| Scope of this documentation change | Verified by pre-publication path/diff review | Four changed paths are Markdown-only; no application/runtime/route/dependency/persistence/listener/CORS paths changed; `git diff --check` and targeted Markdown-table checks passed |

*End of PKG-02E. It records the PA's G3-D2 decision and reconciles current dependencies; it does not grant implementation authority or answer G3-D3 through G3-D7.*
