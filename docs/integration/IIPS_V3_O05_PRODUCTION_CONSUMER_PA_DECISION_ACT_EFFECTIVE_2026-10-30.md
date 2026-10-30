# IIPS v3.0 — `O-05` Durable Broker-Import Production Consumer — Program Authority Decision Act (`O5-A`)

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01` |
| **Record type** | **PROGRAM AUTHORITY DECISION ACT — EFFECTIVE UPON PUBLICATION AND REMOTE READ-BACK.** The rendered selection requested by `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-REQUEST-2026-10-30-01`. |
| **Authority** | **Program Authority (PA) — Ramki**, in the same cross-repository capacity in which the Gate 3 acceptance, the Gate 4 target-host qualification authority act (`2026-10-23`), the Gate A′ successor provisioning act, `P1-F`, `PA-19`, `PA-20` and `C4-2` were rendered. |
| **Decision** | **`O5-A` — ROUTE A: BOUNDED REFUSING-ONLY DURABLE BROKER-IMPORT CONSUMER AUTHORIZATION. SELECTED AND EFFECTIVE.** |
| **Selection basis** | The PA's explicit selection of `O5-A` from the published request, stated as an instruction to render and publish the act, to implement only the three authorized IPD paths after effectiveness, to validate, and to reconcile `O-05` **without closing it**. `O5-B` and `O5-N` are **not** selected. |
| **Amends** | **Nothing.** This act amends no effective instrument (§2.4). |
| **Preserves unchanged** | `evaluatePortSaveGuard()` and the Gate E W-1 conjunction · `authorized:false` · `IPC_WRITE_OPERATIONS` and `dispatch.ts`'s refusal branch · `protocol.ts`'s closed operation set · migrations `001`–`004` and every schema · every pin, `BASIS_COMMIT`, `BASIS_TREE`, manifest and lockfile · `QE-1`…`QE-11` · Gate 4 result acceptance · Gate 5 · `CV-52`/G24 · `CV-39` · `REG-12` · H-12 · S2/Limb A · DQ-4 · `PA-09` · production eligibility · every fence · every IRR code path · the S6 chain's status as **mandatory for admission** (§4). |
| **Effective date** | **`2026-10-30`** (actual date of publication to `refs/heads/main` with green CI and independent remote read-back; **not backdated**). |
| **Primary publication locus** | **IRR** (`ramkivs/iips-review-recovered`) `docs/integration/` + tracker `§16.219`. Registered by tracker `§16.219` (`CV-CORR-199`; `CHG-2026-10-30-14`; `V1682`–`V1691`). |
| **Baseline at issue** | IRR `main` `bf9956b7033ec2eb3946367ac2f082a4875e2c97`, tree `8e5e1757a04178e9c67181fb35e4ee5da3eca659`; IPD `main` `aa356ec222527e78462740fb6c91d34b9ff6cbbc`, tree `79a9fb6cc4b05b748a402cb604cd3f03419a1d45` (**read-only; zero IPD writes by this act**). |
| **Mutation scope of this act** | **IRR documentation only.** This act authorizes an IPD implementation act; it does not perform it, and it writes no IPD content, no pin, no manifest and no lockfile. |
| **Identifier census at issue** | The reserved act ID had **`5`** recorded references, all of them the reservation itself (decision request ×4, tracker `§16.218` ×1) — no other instrument holds it. `O5-A`/`O5-B`/`O5-N`: confined to the request and its registration. `§16.219`, `CV-CORR-199`, `CHG-2026-10-30-14`, `V1682`–`V1691`: **`0`** prior occurrences on IRR `main` and on PR #382's tracker blob. |

> **The decision, in one sentence.** The PA selects **`O5-A`** — one bounded implementation act, in IPD only, adding a non-test shipped-code consumer of the durable broker-import leg that **demonstrably refuses every write** (`WRITE_NOT_AUTHORIZED`, `storeEffect:'NONE'`) — and nothing else; **`O-05` remains `OPEN`**, the durable leg still cannot persist, and admission remains governed by the unstarted S6 chain.

---

## 1. The selection — rendered verbatim from request §8.2

The request required that the act reproduce the selected option **verbatim**; paraphrase is not selection. The rendered template follows, with `O5-A` marked and the other two options explicitly not selected. Text inside the block is reproduced from the request byte-for-byte except for the three selection marks and their annotations, which are the act's own.

```
PA DECISION — O-05 DURABLE BROKER-IMPORT CONSUMER
Act ID: IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01   (census-verified at issue: reserved, no other holder)

Selected option (mark exactly one):
  [x]  O5-A — ROUTE A            <-- SELECTED BY THE PA ON 2026-10-30
  [ ]  O5-B — ROUTE B            <-- NOT SELECTED
  [ ]  O5-N — NEITHER            <-- NOT SELECTED

------------------------------------------------------------------
OPTION O5-A — ROUTE A: BOUNDED PA AUTHORIZATION
------------------------------------------------------------------
The Program Authority selects Route A and authorizes ONE bounded implementation act, and nothing else:

1. SCOPE. A non-test, shipped-code consumer of the IPD-owned durable broker-import leg may be added in
   `ramkivs/iips-production-market-data` only, limited to:
   (a) a new file `src/ipc/brokerImportConsumer.ts` exporting one factory and one function that construct
       `DurablePortfolioStorePort` over the caller's existing database handle and delegate to
       `persistBrokerImport`;
   (b) a bounded edit to `src/ipc/entrypoint.ts` introducing the single call site;
   (c) a new file `tests/q1_broker_import_consumer_wiring.test.ts`.
   No other path may change.

2. PROHIBITIONS. This authorization does NOT permit any change to:
   `src/persistence/portfolio_store.ts` (including `evaluatePortSaveGuard()` and the W-1 conjunction);
   `src/ipc/dispatch.ts` (including `IPC_WRITE_OPERATIONS` and its refusal branch);
   `src/ipc/protocol.ts` or the closed operation set; `src/persistence/durablePortfolioStorePort.ts`;
   migrations 001–004 or any schema; `package.json`, any lockfile, `tsconfig*.json`, `vite.config.ts`,
   `.github/workflows/**`; any existing test other than the new file at 1(c); `scripts/run-tests.mjs` or
   any Limb A path; any `frontend/**` or any IRR path.

3. NEGATIVE DETERMINATIONS. This act does NOT and shall not be read to:
   (a) authorize durable persistence or any successful durable write;
   (b) change the existing `authorized:false` guard;
   (c) open or modify the IPC write-operation set in `dispatch.ts`;
   (d) change existing caller behaviour or introduce an unauthorized write route;
   (e) satisfy QE-1 through QE-11;
   (f) constitute Gate 4 result acceptance;
   (g) authorize Gate 5 naming or admission of any operation;
   (h) satisfy CV-52 / G24 admission;
   (i) authorize H-12 adoption, S2/Limb A changes or the DQ-4 freeze;
   (j) grant production eligibility, production deployment or production operation authority.

4. NOTHING AMENDED. This act amends no effective instrument. It does not amend the Gate 4 target-host
   qualification act, the Gate A′ successor provisioning act, the U2 write-guard adapter act, Gate E W-1,
   contract v1, any fence, any pin, `BASIS_COMMIT` or `BASIS_TREE`. It supplies the express authorization
   whose absence the 2026-10-28 row-28 packet recorded; that packet is not effective and is not superseded.

5. REQUIRED EVIDENCE. Before O-05 may be described as narrowed, the implementing pass must publish:
   the merged commit with green PR-head and post-merge CI and remote blob read-back; a repeated non-test
   importer census showing at least one importer under `src/`; the executed refusal test showing
   `WRITE_NOT_AUTHORIZED`, `storeEffect:'NONE'`, zero row delta across all four statement classes and no
   transaction begun; byte-identical `portfolio_store.ts`, `dispatch.ts` and `protocol.ts`; a browser-pack
   forbidden-token check with no hits; and an attestation that no gate, fence, pin, CV-* status or admission
   status moved.

6. STATUS CONSEQUENCE. O-05 remains OPEN. Only its state-2 limb ("a runtime consumer is wired to the
   persistence port") may be recorded as satisfied at code level. The "obtain admission" limb is untouched
   and remains governed by Route B.

------------------------------------------------------------------
EFFECTIVENESS
------------------------------------------------------------------
This decision is effective only on publication of this exact text to the authoritative repository's
refs/heads/main with green CI and independent remote read-back. It is not effective on signature, on
drafting, on inclusion in any branch, or on any representation that the PA "intends" an option. It takes
effect on the actual date of publication and is not backdated. It authorizes only what its selected
option states, and nothing else.
```

**`O5-B` is NOT selected.** The S0–S6 chain is **not** directed by this act, is not waived, is not deferred by implication, and remains exactly as recorded — including `DQ-4` freeze not performed, `PA-09` open, `P-1` authorized-but-unspent under `P1-F`, H-12 not adopted, `S3` not started, `QE` **0/11**, Gate 4 result acceptance not rendered, Gate 5/`CV-52` not initiated.

**`O5-N` is NOT selected.** `O-05` is therefore not left in the "no authorized action" state; the bounded action of §1 is authorized and the prohibited set of §2 is unaffected.

---

## 2. The six operative clauses as binding obligations

Each clause of §1 is operative from effectiveness. Stated as obligations on the implementing pass:

### 2.1 Scope (clause 1) — three paths, IPD only, and the boundary is file-level

| Path | Permitted change | Form |
|---|---|---|
| `src/ipc/brokerImportConsumer.ts` | **new file** | one factory + one function; constructs `DurablePortfolioStorePort` over the caller's **existing** handle; delegates to `persistBrokerImport`. Opens no connection, no file, no transaction |
| `src/ipc/entrypoint.ts` | **bounded edit** | the **single** call site, constructed over the handle the process already opened; no phase, ordering, endpoint or dispatch change |
| `tests/q1_broker_import_consumer_wiring.test.ts` | **new file** | proves the refusal, the zero store effect and the unchanged boundaries |

"No other path may change" is literal. In particular the change may **not** touch the write-gate port itself (`durablePortfolioStorePort.ts`), which is the boundary being exercised, nor `portfolio_store.ts`, which holds the guard.

### 2.2 Prohibitions (clause 2) — enforced by diff inspection, not by intention

A change to any of `src/persistence/portfolio_store.ts`, `src/ipc/dispatch.ts`, `src/ipc/protocol.ts`, `src/persistence/durablePortfolioStorePort.ts`, migrations `001`–`004`, any schema, `package.json`, any lockfile, any `tsconfig*.json`, `vite.config.ts`, `.github/workflows/**`, any pre-existing test, `scripts/run-tests.mjs`, any Limb A path, any `frontend/**` path, or **any IRR path** voids the authorization for that pass. The changed-file set of the implementation PR must equal the three paths of §2.1 exactly.

### 2.3 The ten negative determinations (clause 3)

Determinations (a)–(j) are reproduced as §1 clause 3 above and are binding on every reader of this act. No merge, CI result, test name, tracker entry or later summary may convert any of them into a positive: **no durable write**, **no guard change**, **no IPC write-set change**, **no caller-behaviour change or new write route**, **no QE satisfaction**, **no Gate 4 result acceptance**, **no Gate 5 naming/admission**, **no `CV-52`/G24 admission**, **no H-12/S2-Limb-A/DQ-4 movement**, **no production**.

### 2.4 Nothing amended (clause 4)

This act is **purely additive**. It supersedes, qualifies and reinterprets **no** prior instrument. Where a prior instrument prohibits an action *"without a further act"*, this act **is** that further act, and only for the three paths of §2.1. Where a prior instrument is self-scoped (the U2 write-guard adapter act's *"no new write route"* and *"IPC caller behavior unchanged"*), this act leaves it operative: no write route is added, and no existing IPC caller changes. Where the `2026-10-28` row-28 packet §9 recorded that express authorization *"does not exist"*, that record was correct on its date and remains a true historical statement; it is neither amended nor relied on as a prohibition.

### 2.5 Evidence (clause 5)

The evidence set is fixed and must be published, not asserted: merged commit + green PR-head and post-merge CI + remote blob read-back; a repeated **non-test importer census** showing ≥ 1 importer under `src/`; the **executed** refusal test showing `WRITE_NOT_AUTHORIZED`, `storeEffect:'NONE'`, zero row delta across **all four statement classes** (create/save/reset/delete statements in the transaction path) and **no transaction begun**; byte-identical `portfolio_store.ts`, `dispatch.ts`, `protocol.ts`; a browser-pack forbidden-token check with no hits; and an attestation that no gate, fence, pin, `CV-*` status or admission status moved.

### 2.6 Status consequence (clause 6)

`O-05` remains **`OPEN`**. The only movement permitted is that its **state-2 limb** — *"a runtime consumer is wired to the persistence port"* — may be recorded as **satisfied at code level**, with the express qualifier that the consumer **cannot successfully persist**. The admission limb is untouched.

---

## 3. What the implementation must demonstrate, and how

| Requirement | Demonstration owed |
|---|---|
| Consumer is shipped code, not a test fixture | Non-test importer census over `src/`: at least one importer of `brokerImportConsumer` that is not a test file, plus the entrypoint call site |
| Reachable only through the bounded call site | The consumer is constructed **once**, in `entrypoint.ts`; `dispatch.ts` names neither the module nor the factory; no IPC operation routes to it; the closed operation set is unchanged |
| Refusal is deterministic | Repeated submissions return an identical outcome; the guard is a constant, not configuration |
| `WRITE_NOT_AUTHORIZED` | The outcome's `code` |
| `storeEffect: 'NONE'` | The outcome's `storeEffect` |
| No durable store operation occurs | Row counts across `portfolios`, `portfolio_revisions`, `portfolio_holdings`, `portfolio_contributions` unchanged; `DatabaseSync.isTransaction` false; a whole-database snapshot equal before and after |
| Guard and write set unchanged | `evaluatePortSaveGuard()` still returns `authorized:false` with the two W-1 reasons; `IPC_WRITE_OPERATIONS` still the four writes; the refusal branch still precedes dispatch |
| Callers unchanged | `dispatch.ts`, `protocol.ts` and every pre-existing test byte-identical |
| No excluded record moved | The implementation PR's changed-file set is exactly the three authorized paths; no IPD tracker, pin, manifest or migration is touched |

**A recorded architectural fact this act relies on and does not change.** The write-gate boundary is the **port**, not the store class: `DurablePortfolioStorePort` calls `evaluatePortSaveGuard()` before every mutating method, whereas `DurablePortfolioStore` itself is a lower-level component used by qualification fixtures. A consumer that constructed the store directly would bypass W-1; the authorized consumer therefore constructs **only** the port. This is why §2.1 names the port and why the prohibited set names the file that holds the guard.

---

## 4. The preserved determination — S6 remains mandatory for admission

This act does **not** disturb the determination recorded in request §6 and tracker `§16.218.3`, which remains the operative reading of the governing texts:

> **S6 is mandatory for *admission*. It is not a precondition for *implementing* a consumer. Route B is not a prerequisite of Route A; Route A is not an alternative to Route B in respect of admission; neither route alone closes `O-05`.**

Accordingly, after this implementation the following remain **unmet, unrouted and unauthorized**:

1. `QE-1`…`QE-11` — not executed, not satisfied, not implied by any test in either repository.
2. **Gate 4 result acceptance** — not rendered. A separate, expressly worded PA act is required.
3. **Gate 5 admission / `CV-52` / `G24`** — not initiated. Admission must **name** the operations it admits, and whether the durable broker-import operations are among them is a question for that act alone.
4. **Actual durable-write enablement** — impossible under the current build: `W-1(3)`/`W-1(4)` are false, the guard is hard-false, `dispatch.ts` refuses the write set before mutation, and no act has lifted any of that. Enabling a write is a **separate authority question** that this act answers in the negative (clause 3(a)).
5. **H-12**, **S2/Limb A**, **DQ-4**, **`PA-09`** — untouched (clause 3(i)).

---

## 5. Boundaries — what this act does not authorize

This act is **not** authority for, and must not be cited as evidence of:

- a successful durable write, a `durable:true` product claim, or any `503` lift;
- any change to `evaluatePortSaveGuard()`, the W-1 conjunction, `IPC_WRITE_OPERATIONS`, `dispatch.ts`, `protocol.ts`, the port, migrations, schema, `package.json`, lockfiles, `tsconfig*`, `vite.config.ts`, CI workflows, `scripts/run-tests.mjs` or any Limb A path;
- any new IPC operation, route, endpoint, listener, browser surface or caller behaviour change;
- any client-controlled identity, tenant or ownership — the consumer takes an owner from its in-repository caller and derives nothing from request content;
- any `QE`, Gate 4 acceptance, Gate 5 naming/admission, `CV-52`/`G24`, H-12 adoption, S2/Limb A change, DQ-4 freeze, `PA-09` disposition, `CV-39` re-open or `REG-12` promotion;
- any pin, `BASIS_COMMIT`, `BASIS_TREE`, manifest, lockfile or count change in either repository;
- production eligibility, deployment, operation, or any non-production → production transition;
- **any write by IRR into IPD, or by IPD into IRR**. The implementation is IPD-owned; the register is IRR-owned; each is cited by the other, never edited.

**`O-05` is not closed, narrowed in status, or made admissible by this act.** Its status string remains `OPEN`.

---

## 6. Effectiveness record

| Element | Value |
|---|---|
| Effective on | merge to `refs/heads/main` of `ramkivs/iips-review-recovered` **+ green CI + independent remote blob read-back** |
| Effective date | `2026-10-30` (actual publication date; not backdated) |
| Registration | tracker `§16.219` (`CV-CORR-199`, `CHG-2026-10-30-14`, `V1682`–`V1691`) |
| Post-publication rule | this act is **not edited after merge**; any correction is a **new dated record** |
| Sequence rule | the IPD implementation may not begin until this act is effective under the conditions above |
| Successor identifiers declared free | `§16.220`, `CV-CORR-200`, `CHG-2026-10-30-15`, `V1692` — available to the implementation-evidence registration |

---

## 7. Validation register (`V1682`–`V1691`)

| ID | Check | Result |
|---|---|---|
| `V1682` | Act ID `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-2026-10-30-01` matches the reserved ID in the published request byte-for-byte; census shows no other holder | PASS |
| `V1683` | `O5-A` reproduced verbatim from request §8.2; paraphrased text absent; `O5-B` and `O5-N` marked not selected | PASS |
| `V1684` | All ten negative determinations (a)–(j) present and unaltered | PASS |
| `V1685` | Scope names exactly three IPD paths; "no other path may change" present; IRR paths excluded | PASS |
| `V1686` | Prohibitions list matches request §8.2 clause 2 item-for-item | PASS |
| `V1687` | "Nothing amended" clause present; no prior instrument superseded, qualified or reinterpreted | PASS |
| `V1688` | Evidence obligations match clause 5; S6-for-admission determination preserved (§4) | PASS |
| `V1689` | No gate, `QE`, `CV-*`, pin, manifest, lockfile, count or status is changed by this record; `O-05` remains `OPEN` | PASS |
| `V1690` | Identifier census: `§16.219`, `CV-CORR-199`, `CHG-2026-10-30-14`, `V1682`–`V1691` previously `0`; `§16.216`/`§16.217` and `CHG-2026-10-30-11`/`-12` not reused (PR #382 claims them) | PASS |
| `V1691` | Documentation integrity: one new `## §16.219` heading with no duplicate; `§18.1` unchanged at 51 rows × 17 cells; no conflict markers; LF only; `git diff --check` clean; changed-file set = this act + tracker | PASS |

---

## 8. Signature

**Rendered by:** Ramki — Program Authority, `2026-10-30`, by explicit selection of `O5-A` from `IIPS-V3-O05-PRODUCTION-CONSUMER-PA-DECISION-REQUEST-2026-10-30-01` and direction to publish it, implement only the three authorized paths after effectiveness, validate, and reconcile `O-05` **without closing it**.

**Selected:** `O5-A`. **Not selected:** `O5-B`, `O5-N`.

**Effect:** unchanged until publication. **Effective date:** `2026-10-30`.

*End of act.*
