# IIPS v3.0 — CAP-02 — PA Topology and Ownership Decision — **RENDERED — EFFECTIVE (TOPOLOGY AND OWNERSHIP ONLY)**

> ## STATUS: **EFFECTIVE — TOPOLOGY AND OWNERSHIP ONLY — NO IMPLEMENTATION, TRANSPORT, WRITE, GATE OR ADMISSION AUTHORITY**
> This record **renders** the CAP-02 application-host and persistence-owner determination that
> `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-DECISION-2026-10-23-01` prepared as
> **PROPOSED / NOT EFFECTIVE**. It is a decision, not a proposal.
>
> **It authorizes no source change, no renderer bridge, no transport, no contract change, no write, no
> route activation, no gate movement and no admission.** Operational writes remain disabled; IPD
> continues to return `WRITE_NOT_AUTHORIZED`; all twelve IRR `/api/user-portfolios*` route-method pairs
> continue to answer `503`; the broker-import UI continues to report session-only saves as
> `durable:false`.

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-EFFECTIVE-2026-10-23-01` |
| **Record type** | Rendered Program Authority decision — topology and ownership boundary; limitations and follow-through schedule |
| **Status** | **EFFECTIVE (topology and ownership only)** — implementation remains unauthorized |
| **Decision date / effective date** | `2026-10-23` (UTC) |
| **Decision authority** | Ramki — Program Authority, single owner/user of the single-user personal-use IIPS platform |
| **Authority exercised** | The PA's **standing grant of global decision and execution authority** (2026-10-12), transcribed at `docs/integration/IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2, blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`, **as construed** by `IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (§§4.1, 4.3, 4.7) **plus** the current PA direction of `2026-10-23` instructing this decision to be rendered in this pass |
| **Publication authority** | Standing PR-lifecycle execution and merge authorization `CHG-2026-10-18-02`, applied per §7 |
| **Rendered in repository** | `ramkivs/iips-review-recovered`; branch `arena/96351abc-iips-review-recovered` |
| **Supersedes as a decision request** | `IIPS-V3-CAP02-PA-TOPOLOGY-OWNERSHIP-DECISION-2026-10-23-01` — **preserved, unamended, still published**; only its request status is discharged |
| **Evidence baselines** | IRR `main@9a3f499abc77abc825edf8ee6d673e2b27254ffc` (merge of PR #207, `2026-10-23T07:04:13Z`); IPD `main@73fd8c1644e9725c9a5499e14d42efdfcb4fe2f2`, tree `66020736919befa5e5320550a396187cd351b40e` (read-only) |
| **Mutation boundary** | IRR documentation only. No source, test, schema, mapping, migration, store, route, fence, workflow, ref or issue change. IPD untouched. |

---

## 1. The decision

**It is decided, effective `2026-10-23`, that:**

> 1. **IRR is retained** as the integrated IIPS product/application host under G1-B1.
> 2. **IPD is retained** as the owner of durable portfolio persistence and its same-host IPC interface.
> 3. **No independent IPD-local native application host is created** as an assumed prerequisite for
>    CAP-02, and none is to be assumed in any future CAP-02 manifest.
> 4. **Any future renderer-to-IPD integration must first identify** its actual host composition root,
>    lifecycle owner, bridge boundary and exact implementation files, and obtain a separate effective
>    implementation act naming them, before implementation authorization exists.
> 5. **Transport implementation, durable-write correctness, Gate 4 qualification and result acceptance,
>    Gate 5 admission, and operational write authorization remain distinct decisions or prerequisites**,
>    none of which is satisfied, combined, waived or sequenced away by this decision.
> 6. **All existing write-denial behaviour and IRR HTTP `503` fences are preserved** until the relevant
>    authorities and gates permit a change.

The operative wording is the six-item disposition prepared in the proposal's §3. This record adopts it
without amendment. No item is reworded, narrowed or widened.

---

## 2. Authority basis, stated exactly

### 2.1 The standing grant

The operative sentence, transcribed verbatim at F-3 §1.2 (blob `c4c9f7d7…`):

> "The single user is the Program Authority and has explicitly granted global decision and execution
> authority for this project. This standing authorization covers the necessary decisions, governance
> records, implementation, testing, corrections, and publication within the established scope. Do not
> request repeated approval for individual decisions or routine implementation steps. The
> authorization does not permit fabricated evidence, weakened safeguards, unrelated scope expansion,
> or claims of success without verification."

### 2.2 The construction applied

`IIPS-V3-DEC06-AUTHORITY-RECONCILIATION-IRR-2026-10-21-01` (IRR blob `4be3ea57…` at the baseline)
establishes, and this record relies on:

| Rule | Effect relied on here |
|---|---|
| **R-1** | The grant is project-wide within established scope and is **not re-asked per decision**; it covers "the necessary decisions, governance records, implementation, testing, corrections, and publication within the established scope". |
| **R-3** | **Authorization, act and proof are three different things.** The grant authorises the *making* of a specific act; the act is the recorded disposition; proof is remote state (merge commit + blob identity). A general grant never substitutes for the act, and the act never manufactures authority. |
| **R-6** | A record may not imply an act it did not perform. This record therefore claims nothing beyond the six items above. |
| **R-7** | **Capacity.** An IRR record may determine authority and fix the boundary; it cannot prove or perform an IPD act. Nothing here asserts an IPD change, an IPD admission or IPD `main` membership of anything. |

Established form (NP-18 and the DEC-06 §8 pattern): the operating session records the bounded,
evidence-bound act under the standing grant, stating plainly that **no new human signature, spoken
selection, approval ID or independently held agent jurisdiction is claimed**. This record follows that
form. Its identifier is a project record ID, not a fabricated approval number.

### 2.3 The current PA direction

In the `2026-10-23` execution directive the PA instructed, in terms, to: apply the existing standing
authorization rather than re-request approval; verify the six-item proposal against the effective
framework; publish the documentation; **render the effective PA decision using the existing
authorization's actual identifier and applicable approval semantics**; record the effective date,
authority reference, selected disposition, rationale, limitations and exclusions; preserve the original
proposal and distinguish the effective decision from it; and **not** treat the merge of PR #207 as the
act that renders the decision. That instruction is applied here and is not treated as a new approval
instrument.

### 2.4 Scope check — why this is inside established scope and not scope expansion

| Test | Finding |
|---|---|
| Is CAP-02 an established PA work item? | Yes — it is the PA's own broker-import integration workstream, already the subject of two published 2026-10-23 investigations and the prepared decision. |
| Does the decision expand a capability, a route, a contract or a gate? | No. It fixes an ownership/topology boundary and expressly declines to create a host. |
| Does it contradict an effective decision? | No — see §3. |
| Does it rely on unverified state or claim success? | No — §3 records what was verified; §5 records what is not. |
| Does it fabricate an approval? | No — §2.2. |

---

## 3. Consistency verification against the effective framework

| Effective record | Requirement it fixes | Consistency finding |
|---|---|---|
| **G1-B1** (`IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md`, blob `857d1451…`) | IRR `main` is the authoritative IIPS product/application host — shell, product routing, product-level transports/orchestration, integrated UX — and is **not** authoritative for IPD-owned domain data or persistence. | **Consistent.** Item 1 restates the host designation; item 2 restates its express limit. Nothing is transferred. |
| **G-2 architectural decision** (blob `7e83946b…`) | IPD owns the user-portfolio domain and durable persistence; extend, do not replace or duplicate; IRR consumes only through a separately governed additive interface. | **Consistent.** Item 2 retains IPD ownership; item 3 avoids creating a duplicate host; item 4 defers the additive interface to a separate act. |
| **Consumer contract v1** (IPD blob `163eb1f1…`) | Client = IRR server process; server = IPD; `portfolio.save` defined but writes unauthorized; caller identity claims refused; no TCP/HTTP/URL listener. | **Consistent and untouched.** Item 6 preserves the current refusal; the decision neither changes the contract nor names a caller. |
| **Effective IPD UI store-port act** (blob `d0657706…`) | Authorizes session dependency inversion only; excludes IPC/transport/durable writes/provisioning/route admission. | **Consistent.** No new authority is inferred for the IPD UI component. |
| **Gate E W-1** (IPD blob `4a9501bf…`) | Writes require all four: Gate E policy, exact Gate 3 implementation authority, Gate 4 qualification **and** separate result acceptance, Gate 5 admission. | **Consistent.** Item 5 preserves the conjunction; §5 records that none of the four is satisfied for the CAP-02 write path. |
| **Gate 3 acceptance / `G3-AMEND-01` / Q1** | Bounded Gate 3 implementation scope only; manifests preserved; runner/script changes excluded; Q1 records render no authority. | **Consistent.** No manifest is reopened, widened or amended; PR #45 path dispositions are untouched. |
| **Gate 4 authority proposal** | `PROPOSED — NOT EFFECTIVE`; execution `NOT AUTHORIZED / NOT STARTED`. | **Consistent.** Item 5 keeps Gate 4 qualification and result acceptance distinct and unmet; this record does not make the proposal effective. |
| **CAP-02 prior records** (transport review; HOST-01) | Transport not present; host/bridge owner unresolved; defer implementation. | **Consistent, and this record resolves the one question they left open** — the ownership boundary — while leaving their transport, contract and evidence findings intact. |

**No conflict required reconciliation.** No effective record had to be overridden, reinterpreted or
silently amended. The disposition does not adopt any alternative that a governing record forbids: it
declines the IPD-local host alternative (item 3), declines any write/transport inference (items 4–6),
and does not touch the IRR-route alternative, which remains excluded from CAP-02.

---

## 4. What this decision changes — and the exact scope of the change

**Changed (governance state only):**

1. The CAP-02 host/ownership question is **answered**: IRR host, IPD persistence/IPC owner, no
   IPD-local host, host composition root to be identified before implementation.
2. A future CAP-02 implementation act now has a fixed boundary to be written against, instead of an
   open architectural question.
3. The prepared proposal's request status is discharged. The proposal itself remains published and
   preserved as history.

**Not changed (explicitly):**

| Domain | State after this decision |
|---|---|
| Source code in IRR and IPD | Unchanged. No file is authorized by this record. |
| IPD write dispatch | Unchanged — `WRITE_NOT_AUTHORIZED` before mutation for every write. |
| IRR route fences | Unchanged — six paths, twelve route-method pairs, identical `503 owner-context-unavailable`; fence blobs remain `51704c12…` / `cb8db45d…`. |
| IPC contract v1 | Unchanged — operations, client scope, refused keys, no-listener rule. |
| Durable store / schema / migrations | Unchanged. |
| Identity resolution, provenance, transactionality | Unchanged; still open prerequisites (§8). |
| Gate 3 / Gate 4 / result acceptance / Gate 5 | Unchanged. Gate 4 remains `PROPOSED / NOT EFFECTIVE`, not started; result acceptance `NOT RENDERED`; Gate 5 `NOT GRANTED / NOT INITIATED`. |
| Broker-import UI durability reporting | Unchanged — `SESSION_ONLY` / `durable:false`. |
| PR #45 path dispositions | Unchanged and not retrospectively ratified. |
| G24, CAP-03, unrelated workstreams | Unchanged; no revival, no status change. |

**Merging PR #207 did not render this decision.** PR #207 (`9a3f499…`, `2026-10-23T07:04:13Z`) published
the proposal and the HOST-01 §14 addendum; its merge is a publication act. The rendering act is this
record. The distinction is the one R-3 requires and is recorded so that a later reader cannot mistake
publication for decision.

---

## 5. Explicit limitations and exclusions

This decision does not itself:

1. Authorize new source changes.
2. Authorize a renderer bridge or new transport.
3. Change the existing v1 IPC contract.
4. Approve schema, identity-resolution, provenance, transaction, or durability changes.
5. Authorize broker-import operational writes.
6. Accept Gate 4 results or grant Gate 5 admission.
7. Authorize activation of the existing IRR user-portfolio routes.
8. Retrospectively authorize paths classified as unauthorized under PR #45's effective authority.

In addition, and with equal force:

9. It does **not** select a bridge technology, a renderer IPC mechanism, a native shell, an HTTP route,
   a port, a lifecycle implementation, or any file that does not already exist.
10. It does **not** create an IRR-host or IPD-host bridge, and it does **not** make CAP-02 dependent on
    CAP-03, on the fenced IRR user-portfolio routes, or on G24.
11. It does **not** satisfy, waive or reorder W-1's four conditions, Gate 4 execution, Gate 4 result
    acceptance, Gate 5 admission or the operational-binding prerequisite.
12. It does **not** convert the CAP-02-HOST-01 requirement that the host composition root be identified
    into a licence to assume one.

---

## 6. Preserved state (operative)

```text
Broker-import UI persistence:        SESSION_ONLY / durable:false
IPD write dispatch:                  WRITE_NOT_AUTHORIZED before mutation (all writes)
IRR /api/user-portfolios* routes:    HTTP 503 owner-context-unavailable (6 paths / 12 pairs)
IPC contract v1:                     UNCHANGED
IPD durable store / schema:          UNCHANGED
Identity resolution / provenance:    UNCHANGED; prerequisites open
Gate 3:                              ACCEPTED for bounded implementation scope only
Gate 4 qualification:                PROPOSED / NOT EFFECTIVE; NOT AUTHORIZED / NOT STARTED
Gate 4 result acceptance:            NOT RENDERED
Gate 5 admission:                    NOT GRANTED / NOT INITIATED
Operational broker-import writes:    NOT AUTHORIZED
CAP-02 topology/ownership:           EFFECTIVE (this record)
CAP-02 transport/implementation:     NOT AUTHORIZED
```

**Continuing obligation, verbatim:** *until the required decisions and gates are effective, the
broker-import UI must continue to report session-only saves as `durable:false`.*

---

## 7. Publication and effectiveness

| Element | Value |
|---|---|
| Rendered | `2026-10-23` (UTC), in this record |
| Effective | **`2026-10-23`** — the governance determination is effective on rendering; its availability as authority from `main` is proven only by the merge commit and remote blob read-back (§9) |
| Publication route | Fixed session branch → IRR PR → required CI → merge under `CHG-2026-10-18-02` |
| Proof of publication | Merge commit + `mergedAt` + blob identity at remote `main`, recorded post-merge in tracker §16.85 |
| If publication fails | The determination stands as a branch-rendered act only; it is **not** effective from `main`, and no implementation may cite it |

An earlier merge, a green CI run, a PR review, an issue comment or the proposal's own publication is
**not** proof of this decision. Only §9's coordinates are.

---

## 8. Consequence: the next authorized step, and what it cannot do

The next step is the **separate exact-scope implementation act** required by item 4 and prepared
alongside this record: `IIPS_v3.0_CAP02_HOST_BOUNDARY_AND_IMPLEMENTATION_ACT_2026-10-23.md`
(`IIPS-V3-CAP02-HOST-BOUNDARY-IMPLEMENTATION-ACT-2026-10-23-01`).

That act is **prepared, not effective**, because implementation authority cannot be manufactured by a
topology decision and because its subject matter is still barred by records that remain in force:

| Blocker | What it bars now |
|---|---|
| **U1 — route/bridge authority** | Exposing a broker-import path to the IRR renderer requires either an admitted product route or an adopted native bridge. The `/api/user-portfolios*` surface is fenced and CAP-02 excludes a CAP-03 dependency; no native host exists in either repository. |
| **U2 — IPD write correctness** | Canonical identity resolution over raw observations, complete provenance, one atomic request transaction, idempotency and outcome-unknown reconciliation are unimplemented in the IPD import path and are not in the closed Gate 3 manifest. |
| **U3 — Gate 4 qualification** | The authority proposal is not effective, its basis is older than current IPD `main`, and no native-host `QE-1`…`QE-11` run exists. Hosted CI is not qualification. |
| **U4 — Gate 4 result acceptance** | A separate act after U3; not rendered. |
| **U5 — Gate 5 admission** | Not granted, not initiated. |
| **U6 — operational write authorization** | W-1's conjunction is unsatisfied, so the guard stays hard false. |
| **U7 — UI read/result contract** | `portfolio.analytics` is reserved and the v1 save result is narrower than the UI contract; the gap is refused rather than fabricated. |

Until U1–U6 are separately satisfied, any implementation "for CAP-02" would either be inert (no
authorized consumer) or would cross a fence, a contract, a manifest or a write gate. Neither is
authorized by this record, and neither is performed.

---

## 9. Verification performed for this record

| ID | Verification | Result |
|---|---|---|
| `V353` | Standing grant located and read at its transcribed source; blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02` re-computed from the working tree | **PASS — authority basis is textual, not inferred** |
| `V354` | DEC-06 reconciliation record read; R-1/R-3/R-6/R-7 relied on; its own status (`RECONCILED — AUTHORITY ESTABLISHED…`) unchanged | **PASS** |
| `V355` | PR #207 inspected before merge: `OPEN`, `MERGEABLE`, CI `Typecheck · Test · Build` `SUCCESS`, exactly three documentation paths, proposal status still `PROPOSED / NOT EFFECTIVE` | **PASS** |
| `V356` | PR #207 merged under `CHG-2026-10-18-02`: `MERGED`, `mergedAt 2026-10-23T07:04:13Z`, merge commit `9a3f499abc77abc825edf8ee6d673e2b27254ffc`; `origin/main` re-read and agrees | **PASS — publication, not rendering** |
| `V357` | Consistency read of G1-B1 `857d1451…`, G-2 `7e83946b…`, v1 `163eb1f1…`, UI store-port act `d0657706…`, W-1 `4a9501bf…`, Gate 3/`G3-AMEND-01`/Q1, Gate 4 proposal, both prior CAP-02 records | **PASS — no conflict; no reconciliation required** |
| `V358` | Six-item disposition adopted without amendment and cross-checked item-by-item against the proposal's §3 wording | **PASS — verbatim adoption** |
| `V359` | Non-effect review: no source/test/schema/mapping/migration/store/route/fence/workflow/ref/issue change; IPD untouched; no gate, admission or write status change; no approval signature or ID fabricated | **PASS** |
| `V360` | Documentation integrity: UTF-8, final newline, no trailing whitespace, balanced code fences, resolving local links, consistent table widths, unique identifiers | **PASS** |

Publication coordinates for this record are established post-merge and recorded in tracker §16.85; they
are deliberately not self-embedded here.

---

## 10. Status statement

```text
CAP-02 host/ownership question:      DECIDED — EFFECTIVE 2026-10-23
  integrated product host:           IRR (G1-B1 retained)
  durable persistence + IPC owner:   IPD (retained)
  IPD-local native host:             NOT CREATED, NOT ASSUMED
  next step:                         exact-scope implementation act (prepared, NOT EFFECTIVE)
CAP-02 transport/implementation:     NOT AUTHORIZED
CAP-02 product durable write:        NOT AUTHORIZED / NOT AVAILABLE
Broker-import UI:                    SESSION_ONLY / durable:false
Gate 4 / acceptance / Gate 5:        unchanged (not effective / not rendered / not granted)
```

*Rendered under the standing grant; recorded in the NP-18 form; no signature or approval identifier is
fabricated. This record decides a boundary — it does not implement one.*
