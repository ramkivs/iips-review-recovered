# WS-A A-8 — Evidence-retrieval route: complete additive U1 amendment package

**Record:** `WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05`
**Type:** PREPARED ADDITIVE AMENDMENT PACKAGE FOR PROGRAM AUTHORITY. Drafting, prerequisite
verification and non-expansion validation only.
**Status:** **`PROPOSED — NOT EFFECTIVE`. Act ID: `PENDING ASSIGNMENT`.** Nothing in this document
is self-executing. **No HTTP route was added, exposed, registered or mounted. No listener was
created. No IPC operation was added.**
**Owner repository:** `ramkivs/iips-review-recovered` (IRR). **Zero IPD writes.**
**Amends (if adopted):** `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01`
(`docs/integration/IIPS_v3.0_CAP02_U1_BROKER_IMPORT_TRANSPORT_AUTHORITY_ACT_EFFECTIVE_2026-10-23.md`,
192 lines, §§1–7.1) by the addition of a new **§8**, preserving §§1–7 verbatim.
**Supersedes nothing.** This package is **additive to**
`WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md`, which established the gap, the closed
route inventory and the *minimum required authority* (§§4.1–4.3). That record is **not modified**.
This package converts its §4 specification into **adoptable instrument text** and adds the
non-expansion validation the gap record did not contain.
**Blocker:** `WS-A-EV-ROUTE-1` — **PENDING AUTHORITY**, unchanged and still open.

---

## 1. Instrument, form and precedent

### 1.1 The form is fixed by the act's own amendment rule

The U1 act has been amended exactly once, by its own §7, whose preamble establishes the form:

> *"This section is an **additive amendment under DEC-06 R-2/R-5**: §§1–6 above are **preserved
> verbatim**. Now that the U7 provider prerequisite and B-1R package compatibility are **verified**
> on IPD `main@2d9130e76bb0dc89daeefabaf297e27bdaa84250` (PRs #54, #58, #59), and the successor
> composition act … authorizes the IRR `PortfolioStorePort` adapter and `BrokerImportModal` mount,
> the narrow revision-only read anticipated by §1 above and specified by U7 §1.4 / §3 is **admitted
> on the existing IRR Node host**."*

Three structural requirements follow, and the proposed §8 at §3 below satisfies all three:

1. **Additive under DEC-06 R-2/R-5**, with all prior sections **preserved verbatim** — §§1–7 and
   §7.1 are not edited, renumbered or restated.
2. **Conditioned on verified prerequisites**, cited by exact coordinate — §7 cited IPD
   `main@2d9130e7…` and PRs #54/#58/#59. The proposed §8 cites its own verified prerequisites at §2.
3. **A route exists only when an act names it.** U1 §3 lists *"No preview/revision GET route…"* among
   what admission does not authorize, and the revision GET became admissible **only** via the
   explicit §7 amendment. U1 §2.4's amendment rule states that *"adding any of them later is a
   boundary change under this act's amendment rule, **not a silent accommodation**."*

### 1.2 The current boundary is closed, and is verified unchanged

`frontend/server/broker-import/brokerImportHttp.ts` `matchRoute()`:

```ts
if (parts.length !== 4 || parts[0] !== 'api' || parts[1] !== 'broker-import') return null;
const leaf = parts[3];
if (leaf !== 'holdings' && leaf !== 'revision') return null;
```

U1 §7.1(1) closes it in terms:

> *"Only `GET` is permitted on `/api/broker-import/:portfolioId/revision` … Only `POST` is permitted
> on `/api/broker-import/:portfolioId/holdings` … **`/api/broker-import/:portfolioId/preview` and
> all other paths under `/api/broker-import/` remain `404 not found`.**"*

**Verified this pass:** `frontend/server/broker-import/brokerImportHttp.ts` is **byte-identical**
between IRR `ba64b2d5927c2f872560710cf1474c25a5cde0d5` (the H-12 R5 `IRR_qe_consumer` coordinate)
and IRR `main` `bcf067061bff42c4b69416dbe33205909cd8ce85` — Git blob
**`cd0b42d1c7803f9451586194e42c0357135271d2`** at both coordinates. The two-route closure has
**not** drifted across **456 commits**, so the compatibility premise of this amendment is current
fact, not a
recollection. Today an evidence path under this namespace returns `404` — and that `404` is the
**correct, governed** behaviour, not a defect to be fixed.

---

## 2. Prerequisite verification (the §7 pattern — verified before, not assumed)

§7 was conditioned on prerequisites verified at a named coordinate. The proposed §8 is conditioned
on the following, each verified `2026-11-05` against the current remote state.

| # | Prerequisite | Verification | Result |
| :--- | :--- | :--- | :--- |
| **P-1** | The evidence journal exists, is merged and is **not** to be recreated. | IRR PR **#434**; `frontend/server/broker-import/brokerImportEvidenceStore.ts` present at `main` `bcf0670`. | **VERIFIED** |
| **P-2** | Journal durability is already proven across separate OS processes; a route adds **no** new durability claim. | `brokerImportEvidenceRestart.test.ts` present at `main`; R2 report §7. | **VERIFIED** |
| **P-3** | Retention is idempotent and tamper-fail-closed. | `importId = sha256(broker ‖ contentDigest ‖ readAt)`; duplicate retention is a no-op; `recordDigest` re-verified on read; measured stable across 3 processes (`3f519e1c…30f4`). | **VERIFIED** |
| **P-4** | Raw CSV bytes are **not** retained, so the route cannot serve them. | Merged behaviour; the product copy states the file *"is processed in this browser only, not uploaded or stored"*; ingestion is a browser-local `File.text()` read with a 1 MiB cap and is never uploaded. | **VERIFIED** |
| **P-5** | The `/api/broker-import/` boundary is closed at two routes and undrifted. | §1.2 above; `brokerImportHttp.ts` blob `cd0b42d1c7803f9451586194e42c0357135271d2` byte-identical `ba64b2d5` → `bcf0670` (456 commits). | **VERIFIED** |
| **P-6** | The existing `/api/evidence/:id` route is **not** this route and must not be widened. | `frontend/server/executive-transport.ts:970` serves `computeCertifiedEvidence(id)` — a credential-free read of **certified reference screen** evidence, with no owner scoping, no tenant scoping, no retention semantics and no consent surface. | **VERIFIED — NOT REUSABLE** |
| **P-7** | PF-1 supplies **no** HTTP owner boundary, so a separate owner-context authority is mandatory. | `server/persistence/persistence-service.ts`: *"A trusted CALLER is responsible for supplying tenant/owner scope; this service is a **library authority, not an HTTP identity or access-control boundary**."* | **VERIFIED — gap is real** |
| **P-8** | An owner-carrier instrument of the required shape already exists as precedent. | `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` (Option B carrier): two fixed owner literals established **by the act**, bound by the SHA-256 of the carrier's canonical bytes, and *"may never be the origin of a value change: a change requires a new governed PA act."* | **VERIFIED — shape at §3.2** |
| **P-9** | Compaction / purge is **not** built, so a retention period cannot be inferred from code. | PF-1 **TD-3**: compaction explicitly **NOT** built in v1. The journal is append-only. | **VERIFIED — must be fixed by the act** |
| **P-10** | Current frontend validation evidence is byte-identical to what PR #436 recorded. | `gh api …/compare/51fdcd95…4162a9ea` → **7 files changed, `0` under `frontend/`**; then `git diff --name-status 4162a9ea…bcf0670 -- frontend/` → **4 files**, all NP-06 Reports (`persist-real-reports.ts`, `real-report-persistence.test.ts`, `ReportsRealData.test.tsx`, `tsconfig.replay-server.json`) and **none** in the broker-import or fence surface. PR #436's broker-import evidence (`test:ci` **111 files / 1,386 tests / 0 failed**; `build` PASS; hosted CI run `42001913262` PASS) therefore **carries forward unchanged** to current `main` `bcf0670`. | **VERIFIED — no re-run needed** |

**P-10 is why no test suite was re-run for this package.** Re-running already-passing tests without
a specific gate requirement is out of scope; instead the *absence of drift* was measured, which is
the stronger and cheaper claim.

### 2.1 One prerequisite had to be CORRECTED, not reused

The gap record §1.3 states: *"All twelve `/api/user-portfolios*` route-method pairs return HTTP 503
with byte-stable fence blobs (`server/user-portfolio/fenceUnchanged.test.ts` re-asserts them, and
also asserts `/api/broker-import` remains in the guarded path family)."*

**That baseline has been superseded** by authorized work in another session: IRR commit **`9202e7a`**
(`2026-11-01T16:56:53Z`, *"Integrate Direct P1 user portfolio reads over IPC"*, preceded by
`e9df332` `2026-10-31` *"Authorize one-pass CAP03 P1 completion"*) rewrote
`fenceUnchanged.test.ts` (**+128 / −462**) and `user-portfolio-transport.ts` (**+152 / −25**). The
test's own current header records it:

> *"The historical G-3 all-route 503 fence was **superseded for the explicitly authorized read-only
> list/detail/revision paths** by the Direct P1 IRR integration. This suite keeps the fail-closed
> owner precondition, no-identity, no-write, C8 loopback/CORS, and certified-route invariants; it no
> longer asserts that admitted IPC reads are unreachable."*

**The current fence baseline — read from the authoritative test and transport source at `main`
`bcf0670`, and re-verified as unchanged by PR #438 (`git diff --name-status 4162a9ea…bcf0670 --
frontend/server/user-portfolio/ frontend/server/broker-import/
frontend/server/user-portfolio-transport.ts` is empty):**

| Surface | Current behaviour |
| :--- | :--- |
| `GET`/`HEAD` `/api/user-portfolios`, `/api/user-portfolios/:portfolioId`, `/api/user-portfolios/:portfolioId/revisions` | **ADMITTED** as read-only IPC reads when the binding precondition is present; **503 `owner-context-unavailable`** when absent. Still fail-closed; still reads no request identity. |
| `POST /api/user-portfolios`, `DELETE /api/user-portfolios/:portfolioId`, `PUT /api/user-portfolios/:portfolioId/holdings`, `POST /api/user-portfolios/:portfolioId/reset`, `GET /api/user-portfolios/context` | **503 `operation-not-admitted` — unadmitted even WITH a binding assertion.** |
| `owner-context-unavailable.ts` | Blob **`cb8db45d668d28cee7e0a52721001d579a872733`** asserted byte-identical; frozen; non-disclosing (no `applicationUserId`, `tenantId`, `principal`, `DEFAULT_PORTFOLIO`). |
| `user-portfolio-transport.ts` recorded blob `51704c12a467cd2f718a030b5036bc55c9afa73f` | Assertion **removed** — the file legitimately changed under the Direct P1 integration. |
| `/api/broker-import/` namespace | Still guarded by `isOwnerScopedApiPath`; still closed at two routes (§1.2). |

**This correction strengthens the amendment's premise rather than weakening it.** The Direct P1
integration establishes an **existing, effective precedent** for admitting a *read-only*,
*owner-scoped*, *fail-closed*, *no-identity-read* IPC route on the existing IRR Node host — which is
exactly the shape of the evidence route proposed here. **Writes and context discovery remain
fenced.** `W-1`, `evaluatePortSaveGuard()`, the P04 quarantine, DP-2 Option 2F, Gate 4 and Gate 5
are **unaffected**: no write path was admitted, `WRITE_NOT_AUTHORIZED` and `storeEffect 'NONE'` are
unchanged, and `savedRows` remains 0.

The superseded "twelve 503 pairs" wording is indexed **additively as superseded-for-currency** in the
tracker at §16.250; the gap record itself is **not edited**, preserving the historical record.

---

## 3. PROPOSED AMENDMENT TEXT — adoptable instrument, verbatim

> **DRAFTING NOTE — NOT EFFECTIVE.** Everything inside the ruled block below is **proposed text for
> PA adoption**. It is drafted so that, if the PA adopts it, it can be appended to the U1 act as §8
> without further drafting. **Adoption requires the PA's own act and Act ID. Publication of this
> package does not adopt it, and IRR must not implement any part of it until an effective act is
> published and remotely read back.**

---

### 8. Additive evidence-retrieval route admission (proposed `2026-11-05`)

This section is an **additive amendment under DEC-06 R-2/R-5**: §§1–7 and §7.1 above are
**preserved verbatim**. Now that the PF-1 broker-import evidence journal is implemented and merged
(IRR PR #434), restart-proven across separate OS processes, idempotent on
`importId = sha256(broker ‖ contentDigest ‖ readAt)` and tamper-fail-closed on `recordDigest`; and
now that the read-only owner-scoped IPC admission pattern is established and effective on the same
IRR Node host by the Direct P1 integration (IRR `9202e7a`, `2026-11-01`); the narrow evidence read
anticipated by the WS-A gap determination
`WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05` §4.1 is **admitted on the existing IRR Node
host**:

```text
GET /api/broker-import/:portfolioId/evidence/:importId
```

#### 8.1 Transport admission

1. **Exactly one route is admitted.** `GET /api/broker-import/:portfolioId/evidence/:importId`.
   **No list-and-enumerate variant is admitted.** A route that enumerates `importId` values for a
   portfolio, or that returns more than one record, is **not** authorized by this section and
   requires a further act.
2. **Route/method discipline.** Only `GET` is permitted on this path (other methods →
   `405 Allow: GET`). Any query string is refused (`400 invalid-request` **before** any socket).
   §7.1(1)'s closure is **preserved and extended, not relaxed**: `POST` remains the only method on
   `…/holdings`, `GET` the only method on `…/revision`, and **every other path under
   `/api/broker-import/` remains `404 not found`**, including `…/preview`.
3. **Handler order is identical to §2.2 and §7.1(2)–(3).** C9 first-party signal is checked **first**
   (cross-site → `403 cross-site-request-refused`); `IIPS_G3_IPC_BINDING_PROVISIONED` is checked
   **next** (absent → `503 owner-context-unavailable` **before** any adapter or socket is
   constructed); the opaque `portfolioId` is validated via `validatePortfolioIdParam` **before any
   I/O**; then one scoped journal read. No step may be reordered, skipped or made lazy.
4. **Network invariant is preserved verbatim.** **No new HTTP/TCP listener. No new IPC operation.**
   The route is served by the **existing** IRR Node host and the **existing** Vite `/api` proxy.
5. **Non-disclosure on every refusal.** No stack, provider detail, owner, tenant, socket path, row
   value or identifier is echoed on any refusal. Static reason only. A foreign, absent, tombstoned
   or malformed `importId` is **indistinguishable** from a valid-but-unowned one: `404`, never an
   enumeration signal, never `403`, never a partial record.
6. **Response surface.** The retained record's **evidence fields only**: the parsed row inventory,
   the content and record digests, the per-row identity evidence, and the refusal details. **No
   canonical `companyId`**, consistent with §2.3 and with the preview boundary. **No raw CSV bytes**
   — none are retained (P-4).

#### 8.2 Owner-context carrier and digest binding

7. **The carrier is established by this act, never by code.** Following the NP-06 R1 Option B shape
   (`IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01`), the tenant and
   owner literals for this route are **fixed here**: tenant `TBD-PA`, owner `TBD-PA`. **These two
   literals are left unfilled deliberately and must be supplied by the PA in the adopting act.**
   IRR does not invent, infer, default or derive them; an adoption published with these placeholders
   unfilled is **not effective** and admits nothing.
8. **Digest binding.** The carrier's canonical bytes are bound by SHA-256, recorded in the adopting
   act's post-merge receipt. The carrier **may never be the origin of a value change**: a change
   requires a **new governed PA act**.
9. **PF-1's boundary is respected, not crossed.** PF-1 `PersistenceService` remains *"a library
   authority, not an HTTP identity or access-control boundary"*. This section supplies the missing
   HTTP owner scope **from the act**; it does not convert PF-1 into an access-control boundary, and
   it does not mount PF-1 on HTTP.
10. **No identity is read from the request.** The route reads no header, cookie, token, credential or
    query value as an identity source. Owner scope comes **only** from the act-fixed carrier plus the
    server-owned local binding precondition, exactly as the Direct P1 reads do.

#### 8.3 Retention and purge

11. **Locality.** Server-owned local data directory only (`IIPS_DATA_DIR`, TD-7a). **Never** a Git
    working tree, **never** a network store, **never** a third party, **never** a browser store.
12. **Scope.** One record per `importId`, per tenant+owner; append-only; duplicate retention is a
    no-op returning the first record unchanged.
13. **Raw bytes remain not retained.** Any change is a **separate act**, not an accommodation.
14. **Volatile fields.** P04 quarantine record ids are process-specific; the **first** retention is
    authoritative and a repeated import returns it unchanged. This limitation is carried inside every
    record and must be carried in the route's response.
15. **Integrity.** `recordDigest` is re-verified on **every** read. Tamper fails closed with
    `EVIDENCE_TAMPERED`. A storage failure propagates; retention is never reported when the write
    failed.
16. **Retention period and purge rule — FIXED BY THIS ACT.** Compaction is **not** built in v1
    (PF-1 TD-3), so no period may be inferred from code. The adopting act must state:
    (a) the retention period `TBD-PA`; (b) the purge rule `TBD-PA`; (c) whether purge is
    time-based, count-based or explicit-only. **Until (a)–(c) are filled, no HTTP surface may serve
    indefinite accumulation of parsed personal financial evidence, and this section is not
    effective.** Purge must never be reachable from the HTTP surface: the admitted route is
    **read-only**, and no `DELETE` is admitted anywhere in this namespace.
17. **Restart.** Already proven across separate OS processes. **This section adds no new durability
    claim.**

#### 8.4 Reconciled consent

18. The adopting act must re-declare, **in the product's own words and in the UI copy**, all four of
    the following, and IRR must not implement the route until the copy is reconciled:
    1. that parsed broker-import evidence **is** retained locally in the owner's data directory —
       already true and already disclosed in the record's limitations, but the current page copy
       still says files are *"not uploaded or stored"*, and the two **must be reconciled by the act**,
       not by an implementation choice;
    2. that the **raw CSV bytes are not retained**, and that the retained equivalent is the parsed row
       inventory, the digests, the per-row identity evidence and the refusal details;
    3. that the retained evidence is **served only to the same local owner scope**, is never
       transmitted to any third party, and that **no route enumerates another owner's records**;
    4. that retention of evidence is **not** a save, **not** a validation, **not** an authorization and
       **not** durability of holdings — `savedRows` stays **0** and `WRITE_NOT_AUTHORIZED` is
       unchanged.

#### 8.5 Compatibility with the closed two-route boundary

19. **The closure is extended by exactly one leaf and is otherwise untouched.** `matchRoute()`
    currently admits `holdings` and `revision`; adoption would admit `evidence` **only in the
    five-segment form** `api/broker-import/:portfolioId/evidence/:importId`. Four-segment
    `api/broker-import/:portfolioId/evidence` remains **`404`** — no collection endpoint, no
    enumeration.
20. **The twelve-pair write fence is unaffected.** Per §2.1 of the amending package, writes and
    context discovery on `/api/user-portfolios*` remain **503 `operation-not-admitted`** even with a
    binding assertion. This section admits **no** write anywhere.
21. **`owner-context-unavailable.ts` blob `cb8db45d668d28cee7e0a52721001d579a872733` stays
    byte-identical**, frozen and non-disclosing.
22. **Import safety is re-asserted.** `brokerImportImportSafety` must continue to hold: importing
    the route modules **listens, connects, writes and registers nothing**.
23. **`/api/evidence/:id` is untouched.** It remains a credential-free read of certified reference
    screen evidence. It is **not** reused, widened, repurposed or made to serve broker-import
    evidence.

#### 8.6 What this section does NOT authorize

24. Any write, any durable-success claim, any `durable: true`, any commit receipt, any fabricated
    `PortfolioRecord`. Any `W-1` change or relaxation. Any Gate 4 or Gate 5 movement. Any fence lift.
    Any P04 quarantine change. Any DP-2 Option 2F change. Any real-user durable save. Any production
    scope. Any change to IPD. Any new HTTP/TCP listener. Any new IPC operation. Any enumeration of
    evidence records. Any raw-byte retention or retrieval. Any third-party transmission. Any change
    to the dependency pin. Any D05 deposition. **Retention of evidence is not a save, not a
    validation and not durability of holdings.**

#### 8.7 Publication and effectiveness

25. This section becomes effective **only** upon: the PA's adopting act with a assigned Act ID and the
    §8.2(7) owner literals and §8.3(16) retention values filled; publication to IRR `main`; green
    exact-head **and** post-merge `main` CI; and independent remote read-back. Publication
    coordinates are recorded **exclusively** in the post-merge tracker receipt and are **never
    self-embedded** in the act.

---

## 4. Non-expansion validation

The standing requirement is that the proposal **must not silently expand existing authority**.
Validated element by element against U1 §§1–7.1 and the effective fence state.

| Proposed element | Existing authority it touches | Relation | Verdict |
| :--- | :--- | :--- | :--- |
| One `GET` route in `/api/broker-import/` | §7.1(1) closes the namespace at two routes | **Additive by the act's own amendment rule** (§2.4: a boundary change, *not a silent accommodation*). Named expressly, not implied. | **NO SILENT EXPANSION** |
| Method discipline `GET`-only, `405`, query string → `400` | §7.1(1) identical pattern for `…/revision` | **Identical**, copied not widened. | **NO EXPANSION** |
| Handler order C9 → binding → `portfolioId` → one read | §2.2, §7.1(2)–(3) | **Identical**. | **NO EXPANSION** |
| No new listener, no new IPC operation | U1 network invariant | **Preserved verbatim.** | **NO EXPANSION** |
| Non-disclosure, `404` for foreign/absent | §7.1(5) `404 RESOURCE_UNAVAILABLE` "indistinguishable from missing/foreign/tombstoned; **never** invents `revision: 0`" | **Identical principle**, applied to `importId`. | **NO EXPANSION** |
| Owner carrier fixed by the act, SHA-256-bound, never code-originated | NP-06 R1 Option B precedent | **Same shape, same constraint.** | **NO EXPANSION** |
| No identity read from the request | U1 §2.2; Direct P1 pattern at `9202e7a` | **Narrower than** a general auth surface: no credential is accepted at all. | **STRICTLY NARROWER** |
| Response = evidence fields only, no `companyId`, no raw bytes | §2.3 browser projection rules; merged retention behaviour | **Narrower than** the record: raw bytes excluded, canonical id excluded. | **STRICTLY NARROWER** |
| Locality `IIPS_DATA_DIR` only | TD-7a | **Identical.** | **NO EXPANSION** |
| Retention period + purge fixed by the act | PF-1 TD-3 (compaction not built) | **New requirement imposed on the act**, not a new power taken. Purge is **not** HTTP-reachable. | **NO EXPANSION — adds a constraint** |
| Reconciled consent re-declared by the act | Current UI copy *"not uploaded or stored"* | **Requires the act to reconcile a contradiction** rather than letting code resolve it. | **NO EXPANSION — adds a constraint** |
| Read-only; no `DELETE` in the namespace | §7.1(1) | **No write surface created.** | **NO EXPANSION** |
| `/api/evidence/:id` untouched | `executive-transport.ts:970` certified-reference read | **Expressly not reused or widened** (§8.5(23)). | **NO EXPANSION** |
| Write fence on `/api/user-portfolios*` | Current state: 503 `operation-not-admitted` even with binding | **Unaffected** (§8.5(20)). | **NO EXPANSION** |
| `W-1`, Gate 4, Gate 5, P04, DP-2 2F, production scope, IPD writes, pin change, D05 | Various | **Expressly excluded** by §8.6(24). | **NO EXPANSION** |

**Validation result: the proposal does not silently expand existing authority.** Every element is
either **identical** to an existing admitted pattern, **strictly narrower** than the capability it
exposes, or an **additional constraint imposed on the adopting act**. The two genuinely new powers
requested are (a) one named read route and (b) one act-fixed owner carrier — and both are requested
**expressly**, in the instrument the act's own amendment rule designates, with the placeholders that
only the PA may filled left visibly unfilled.

### 4.1 Three unfilled placeholders, deliberately

The proposal is **not adoptable as published**. Three values are left `TBD-PA` on purpose, because
supplying them would be fabrication:

| Placeholder | Location | Why IRR must not fill it |
| :--- | :--- | :--- |
| Tenant literal, owner literal | §8.2(7) | NP-06 R1 requires these to be established **by the act**. Inventing an owner identity for a personal-financial-evidence read surface is exactly the class of fabrication the standing instructions prohibit. |
| Retention period, purge rule, purge basis | §8.3(16) | No period exists in code (PF-1 TD-3). Choosing one is a policy decision about indefinite accumulation of personal financial evidence. |
| Act ID | header | Act IDs are assigned by the PA. **`PENDING ASSIGNMENT`.** |

---

## 5. Implementation readiness (prepared, NOT performed)

Recorded so that implementation can begin immediately on effectiveness, and so it is unambiguous
that **none of it has been done**.

| Step | File | Status |
| :--- | :--- | :--- |
| Extend `matchRoute()` to the five-segment `evidence` form only | `frontend/server/broker-import/brokerImportHttp.ts` | **NOT WRITTEN** — file is byte-identical to `ba64b2d5` |
| Owner-carrier module for the route | new file, NP-06 R1 shape | **NOT WRITTEN** |
| Scoped read handler with the §8.1(3) order | `frontend/server/broker-import/` | **NOT WRITTEN** |
| Vite `/api` proxy — **no change required** | `frontend/vite.config.ts` | No new listener (§8.1(4)) |
| Fence re-assertion at the **current** baseline (§2.1) | `frontend/server/user-portfolio/fenceUnchanged.test.ts` | **NOT MODIFIED** |
| Import-safety re-assertion | `brokerImportImportSafety` | **NOT MODIFIED** |
| Route-surface tests: `405`, `400` on query string, `404` non-enumeration, non-disclosure, tamper fail-closed | new tests | **NOT WRITTEN** |
| Consent copy reconciliation | UI copy | **NOT MODIFIED** — requires §8.4 first |

**Targeted tests only**, and only for files actually changed. No broad regression suite is run
without a specific gate requirement. The existing PR #436 validation evidence carries forward
byte-identically (P-10), so no re-run is warranted by this package.

---

## 6. Exact outstanding authority and blocker

> **BLOCKER `WS-A-EV-ROUTE-1` — PENDING AUTHORITY (unchanged, still open).** An HTTP
> evidence-retrieval route over the IRR broker-import evidence journal cannot be implemented because
> the admitted `/api/broker-import/` route set is **closed** at two routes by
> `IIPS-V3-CAP02-U1-BROKER-IMPORT-TRANSPORT-AUTHORITY-ACT-EFFECTIVE-2026-10-23-01` (§1 and its §7
> additive amendment), whose network invariant admits no new listener and no new IPC operation, and
> because no act establishes (a) transport admission for a third route, (b) an owner-context carrier
> for the journal — which PF-1 expressly states is *"a library authority, not an HTTP identity or
> access-control boundary"*, (c) a retention period or purge rule, or (d) a consent statement covering
> the serving of retained parsed personal financial evidence.
>
> **What this package adds to the gap record:** the minimum required authority specified in
> `WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05` §4 is now rendered as **adoptable
> instrument text** (§3 above, proposed U1 §8 with 25 numbered clauses), the **non-expansion
> validation** is complete (§4), the prerequisites are **verified at current coordinates** (§2), and
> the **fence baseline is corrected** to the post-Direct-P1 state (§2.1).
>
> **The precise outstanding authority is one instrument:** an **additive amendment to the U1 act under
> DEC-06 R-2/R-5**, preserving §§1–7 verbatim, adopting §3 above as §8, with **Act ID assigned** and
> the three `TBD-PA` placeholder sets filled (§8.2(7) tenant and owner literals; §8.3(16) retention
> period, purge rule and purge basis).
>
> **Accountable:** PA (Ramki) to render the amendment. **IRR to implement only after it is effective,
> published to `main`, green on exact-head and post-merge CI, and independently read back remotely.**
>
> **Completion criteria:** the effective amendment; then IRR implementation per §5 with the §8.1(3)
> handler order, the **current** fence baseline re-asserted byte-stable, import safety re-asserted,
> the consent copy reconciled per §8.4, and remote verification of the merged state.
>
> **Not blocked, and unaffected:** the journal's local durability — implemented, merged (PR #434),
> restart-proven across separate OS processes, tamper-fail-closed and idempotent. And the write
> fence, `W-1`, the P04 quarantine, DP-2 Option 2F, Gate 4 and Gate 5 — **none is relaxed, moved or
> bypassed by this package.**

---

## 7. What this package does not do

1. It **does not claim the amendment is effective.** Status is `PROPOSED — NOT EFFECTIVE`; Act ID is
   `PENDING ASSIGNMENT`. **Prepared authority is not effective authority.**
2. It **does not add, expose, register or mount** any HTTP route. No listener was created; no IPC
   operation was added; `brokerImportHttp.ts` is untouched and byte-identical to `ba64b2d5`.
3. It **does not modify** the U1 act, the gap record, the NP-06 R1 act, PF-1, or any fence test. All
   are preserved. The superseded fence baseline is corrected **additively here and in the tracker**,
   never by rewriting the historical record.
4. It **does not fill** the tenant/owner literals, the retention period or the purge rule. These are
   PA values; supplying them would fabricate an owner identity for a personal-financial-evidence read
   surface.
5. It **does not reuse or widen** `/api/evidence/:id`.
6. It **does not change** any dependency pin, write to IPD, reopen A-1…A-4 / A-16 / A-17, or touch
   IRR PR **#438**.
7. It **does not reopen or question** the Direct P1 read integration at `9202e7a`. It is authorized
   completed work; §2.1 records only its effect on a stale WS-A premise, and cites it as a
   **supporting precedent** for the read-only owner-scoped pattern this amendment requests.
8. It **does not relax** Gate E W-1, the P04 quarantine, Gate 4, Gate 5 or DP-2 Option 2F, and does
   not initiate production work or a real-user save.

---

## 8. Action-register effect

| Action | Status before | Status after this package | Authority still outstanding |
| :--- | :--- | :--- | :--- |
| **A-8** | `PENDING AUTHORITY — PA route amendment required` | **`PREPARED — AMENDMENT PACKAGE COMPLETE; BLOCKED ON PA`**. Adoptable instrument text drafted (25 clauses); 10 prerequisites verified at current coordinates; non-expansion validated element by element; fence baseline corrected; implementation plan ready. | **PA (Ramki):** adopt §3 as U1 §8, assign the Act ID, fill §8.2(7) and §8.3(16). |
| **A-9** | `BLOCKED by A-8` | **Unchanged — still BLOCKED by A-8.** Implementation cannot start before effectiveness. | Same instrument. |

**A-8 is NOT closed.** Blocker `WS-A-EV-ROUTE-1` remains **open**. Milestone WS-A-DM pillar 3
criterion 3.3 (retrieval) remains **AWAITING-AUTHORITY**, and pillar 6 criterion 6.2 (owner carrier)
remains **AWAITING-AUTHORITY**. **WS-A-DM is NOT COMPLETE.**

---

## 9. Dated additive note — the three placeholders are now filled by a PA rendering (`2026-11-05`)

> **This note is additive. §§1–8 above are preserved VERBATIM and are NOT amended, including §4.1's
> table of three unfilled placeholders and §7's statements of what this package does not do. Those
> statements were true when written and remain true of this document. What follows records a later
> state, in a new dated subsection, per additive discipline.**

**The PA rendered decisions 5, 6 and 7 on `2026-11-05`.** The instrument of record is
**`docs/integration/IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md`**,
Act ID **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`**.

### 9.1 Disposition of §4.1's three placeholders

| §4.1 placeholder | Disposition |
| :--- | :--- |
| Tenant literal, owner literal — §8.2(7) | **FILLED, in an amended structure.** The PA required *one stable, application-generated canonical owner ID* with *`SAIRAM`* as its human-readable label. The values are `irr-personal-073dd1c8` and `owner-4dc756b3`, derived by a documented deterministic rule and collision-verified. **`SAIRAM` is excluded from both partition keys**, because F-1/F-2 §4.1 requires keys to be *"Opaque: no personal, username, email, or company identity"* — a requirement a personal name would fail. See the act's §3. |
| Retention period, purge rule, purge basis — §8.3(16) | **FILLED.** Indefinite; explicit-owner-controlled deletion only; expressly **not** time-based and **not** count-based; no automatic purge and **no destructive compaction**. Decision 6 additionally creates two obligations this package did not contain — **storage-usage visibility (O-1)** and **backup/recovery safeguards (O-2)** — and fixes the 50 MB figure as a **warning/review threshold only**, never a deletion trigger. See the act's §4. |
| Act ID — header | **ASSIGNED** under the PA's Decision 7 direction, from the surveyed CAP-02 house convention, collision-verified before assignment: **0** occurrences at IPD `main` and **0** foreign occurrences in the IRR tree or history. See the act's §5. |

### 9.2 One correction to §6's specified amendment form

§6 specified the outstanding authority as *"an additive amendment to the U1 act … adopting §3 above as
§8"*, and §3's drafting note said the text was drafted so it *"can be appended to the U1 act as §8"*.
**That form cannot be used.** The U1 act's blob **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`** is a
**published, remotely-verified anchor**, cited in the effective composition act's 4/4 remote read-back
receipt (`IIPS_v3.0_CAP02_BROKER_IMPORT_MODAL_PORT_COMPOSITION_ACT_EFFECTIVE_2026-10-23.md:207`) and in
two tracker records (`CHG-2026-10-23-18`; verification row `V425`). Appending §8 to that file would
change its blob and invalidate those anchors.

**∴ the amendment is rendered as a SEPARATE INSTRUMENT**, following the model the repository already
established for `G3-AMEND-01` — *"additive, by separate instrument; the governing act remains
byte-identical and unamended, with the amendment governing only the application of the act."* The U1 act
is **not modified**; its blob is asserted unchanged by the act and verified by the post-merge receipt. The
amending instrument's §7 carries the adopted text with **clause numbering identical** to §3 above, so
every cross-reference in this package (`§8.2(7)`, `§8.3(16)`, `§7.1(1)`) continues to resolve.

### 9.3 Effect on §8's action register

| Action | §8's recorded status | Status after the PA's rendering |
| :--- | :--- | :--- |
| **A-8** | `PREPARED — AMENDMENT PACKAGE COMPLETE; BLOCKED ON PA` | **`PA-RENDERED — AMENDMENT ADOPTED AS A SEPARATE INSTRUMENT; PUBLICATION VERIFICATION PENDING`**. The three placeholder sets are filled; the Act ID is assigned. **Not yet effective** — the instrument's §10 conditions (ii)–(iv) (publication to `main`, green exact-head **and** post-merge CI, independent remote read-back) are **PENDING**, and a receipt cannot be part of the commit it verifies. |
| **A-9** | `BLOCKED by A-8` | **Still blocked — implementation NOT AUTHORIZED.** A-9 becomes authorized only when A-8's effectiveness is recorded in a post-merge receipt, and its completion criteria now **additionally include obligations O-1 and O-2** and the clause-18 consent-copy reconciliation. |

**Blocker `WS-A-EV-ROUTE-1` remains OPEN** until those conditions are discharged. **This package does not
claim the amendment is effective, and §7(1) above is not amended by this note.**

### 9.4 Three genuine remaining items, precisely

Recorded here so that §6's phrase *"the precise outstanding authority is one instrument"* is not read as
*"nothing further remains"*:

1. **The deletion surface.** Decision 6 requires explicit owner-controlled deletion; §8.3(16) prohibits
   purge being reachable from the HTTP surface. Both are preserved: deletion is authorized **in
   principle** and is exercisable **only outside** the admitted read-only route, or by a **further act**.
   **Whether to seek such an act is a PA decision** (act §11(1)).
2. **Decision 5's "bind personal holdings" reaches beyond A-8.** This rendering binds the **broker-import
   evidence** scope. Extending `owner-4dc756b3` to **durable holdings persistence** touches a fenced
   domain under F-3 / NP-06 / NP-04 with `W-1` ON, and is **not authorized** — a separate decision if
   intended (act §11(3)).
3. **Decisions 1–4 remain PENDING, and Decision 3's coordinate moved.** Concurrent **PR #446** merged at
   `d7cd3b65` and advanced the broker-import pin from `7bcae35` to **`07e86a4f`** (IPD PR #128). Decision
   3's substance is unchanged but **its named coordinate must be re-censused before the PA signs**
   (act §11(4)).

**WS-A-DM remains NOT COMPLETE.**
