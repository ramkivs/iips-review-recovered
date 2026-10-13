# IIPS v3.0 — NP-12 Governed Screener Program Authority Product-Layer Acceptance Decision

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-DECISION-01` |
| Record type | **Program Authority acceptance decision / attestation** — a distinct, durable governance act. Non-executable: it grants no implementation, promotion, deployment, production, live-data, certification-extension, or identity authority |
| Decision | **`ACCEPT`** — NP-12 Governed Screener **product-layer** qualification and acceptance record accepted for the **non-production** scope defined in that record, subject to all stated limitations and exclusions |
| Acceptance Authority | **Ramki (Ramakrishnan)** — IIPS Application Owner & **Program Authority**; sole Acceptance Authority under `D-N4-CERT-07` (`NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §5.2) and §15(1) of the accepted record |
| Decision date | 2026-10-13 |
| Decision channel | Issued explicitly by the Program Authority in-session to Arena Agent Mode, together with the direction to record it as a distinct durable governance act and to publish it through the repository's normal merge mechanism |
| Recorded and prepared by | Arena Agent Mode — verbatim capture of the Program Authority's decision, independent verification of the cited repository evidence, and record rendering only. **No governance authority is held or claimed, and no decision is rendered on the Program Authority's behalf** |
| Accepted record | `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01` (§3) |
| Accepted record canonical path | `docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md` |
| Scope accepted | The **non-production NP-12 Governed Screener product layer** — the `POST /api/screener` transport (`frontend/server/screener/screener-transport.ts`) and the `/screener` workspace (`frontend/src/features/screener/Screener.tsx`, `frontend/src/api/screener.ts`) — exactly as defined and qualified by the accepted record (§4). No other layer, capability, or scope is accepted |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` / `refs/heads/main` |
| Decision baseline (`origin/main`, verified live) | `61e0bc6ae13ee2c6579106c92d95abeb27bba956`, root tree `4deb73ad8d67e24bddd75e7d02c0f3d2b204ed5b` (§6) |
| Environment | **Non-production.** Production, IPD, live market data, and all persistence domains are out of scope |
| Status | **AS AT PREPARATION: DECISION RENDERED BY PROGRAM AUTHORITY — RECORDED — CANDIDATE. NOT PUBLISHED — NOT EFFECTIVE.** See §11 for the effectiveness condition |
| Effectiveness | This act takes effect **only** when it is merged to `refs/heads/main` of `ramkivs/iips-review-recovered` and that merged state is independently verified remotely (§11) |

---

## 1. The decision, verbatim

The Program Authority issued the following acceptance decision. It is reproduced **verbatim**; it is not broadened, weakened, paraphrased, or reinterpreted by this record.

> I, Ramki (Ramakrishnan), as Program Authority, explicitly ACCEPT
> the NP-12 Governed Screener product-layer qualification and acceptance
> record IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01
> for the non-production scope defined in that record, subject to all
> stated limitations and exclusions.
>
> This acceptance does not authorize production use, live-data authority,
> producer convergence, or any excluded capability.

**Disposition token: `ACCEPT`** — non-production scope only, subject to all stated limitations and exclusions.

---

## 2. Authority basis for this act

| Basis | Source | Effect |
|---|---|---|
| `D-N4-CERT-07` — Acceptance Authority & Later Acceptance Boundary | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §5.2, §6 | **Program Authority (Ramki / Ramakrishnan) is the sole Acceptance Authority.** Formal acceptance is strictly distinct from certification and was deferred until after the dedicated `NP-12 N4` Certification Gate (`N4-A16`), which has been executed and published. No additional or external authority hierarchy exists or is invented |
| `D-N4-CERT-06` — Certification Authority | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §5.1 | Program Authority is the sole Certification Authority for `N4-SD` + `N4-A10` + `N4-A13`. **Certification and acceptance are distinct acts; this record is acceptance of a product-layer record, not certification** |
| `D-N4-CERT-03` — Certification envelope scope | `NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §6 | The platform certification envelope is `N4-SD` + `N4-A10` + `N4-A13` only, and **expressly excludes UI and transport**. The product layer therefore required its own acceptance act, which is what this record supplies |
| `D-N4-A16-ACCEPT-01` — Post-certification Program Authority acceptance | `docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` §8 | `ACCEPT`, covering the three certified platform layers only. **It does not cover UI or transport and is not extended by this record** |
| §15(1) of the accepted record | `docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md` §15 | Effectiveness step 1 requires *"Program Authority review and acceptance of this exact record."* **This act is that review and acceptance** |
| §7 row 6 of the accepted record | same file, §7 | Product acceptance / admission was recorded as **NOT EFFECTIVE**, pending §15. This act supplies the missing Program Authority determination |
| §16.2(5)–(6) of the accepted record | same file, §16 | §16.2(5) records `§15(1)` as **UNRESOLVED / PENDING — NOT EFFECTIVE**; §16.2(6) specifies the **exact remaining governance decision required**: *an explicit Program Authority acceptance decision / attestation confirming review and acceptance of `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01` … for the non-production NP-12 Governed Screener product layer (`POST /api/screener` and `/screener`).* **This record is that exact governance act, rendered in the mechanism §16.2(6) requires — a separate, additive, explicit Program Authority acceptance record** |
| Standing product direction | `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_RECORD.md` §1, §3 B3 | One integrated IIPS **non-production** application; IRR is the product host; 13-engine product taxonomy. Cited as the standing scope within which this acceptance sits; not amended |

**Mechanism determination.** §16.2(6) of the accepted record requires a *separate explicit governance act*, and §16 of that record is a post-publication closure note that may not be rewritten. The smallest appropriate durable artifact is therefore a **separate additive acceptance decision record** — this file. The accepted qualification record and its §16 closure note are **preserved untouched**; nothing in them is edited, deleted, or re-rendered (§10).

---

## 3. The exact record accepted

Acceptance is of **this exact record**, identified by record ID, canonical path, and blob identity. It is not acceptance of any other NP-12 artifact, draft, or layer.

| Item | Verified value |
|---|---|
| Accepted record ID | `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01` |
| Canonical path | `docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md` |
| Record as it stands on `origin/main` at the decision baseline | blob `d3f03ac3fd4ea57036a5de35b0704d308ead3de1` — `467` lines, `49,381` bytes, raw SHA-256 `6224db32ef405760116e2624d1c1b76857c609a7116e29aced8e144664cd8e01` |
| Published qualification record (PR #71) | blob `8209586fc9c515ab360bda91b202d5f378e9a0da` — `400` lines, `38,811` bytes, raw SHA-256 `c6518e510937af970630fe40d188dd50333587671f8c5c98a6a8a2de8ebb6ffd` |
| Byte-for-byte preservation independently re-verified | The first `38,811` bytes (first `400` lines) of the record on `origin/main` hash to `c6518e510937af970630fe40d188dd50333587671f8c5c98a6a8a2de8ebb6ffd` — **IDENTICAL** to the published qualification blob. §§1–15 are intact and unedited |
| §16 post-publication closure note | **PRESENT AND INTACT** (added by PR #72; `+67 −0`, purely additive), including §16.1 provenance, §16.2 closure disposition, §16.3 preserved boundaries, and §16.4 closure summary |
| Record type accepted | Product-layer **acceptance determination** and independent **qualification determination** for the NP-12 Governed Screener product layer |

---

## 4. Scope of acceptance

Acceptance extends to the **non-production NP-12 Governed Screener product layer as defined by the accepted qualification record** — and to nothing else.

### 4.1 Accepted

1. The `POST /api/screener` transport (`frontend/server/screener/screener-transport.ts`) and the `/screener` workspace (`frontend/src/features/screener/Screener.tsx`, `frontend/src/api/screener.ts`) — the **product composition** of the certified NP-12 N4 Screen capability.
2. The product-layer **qualification determination** recorded at §9 of the accepted record: **QUALIFIED (non-production)**, on the nine dimensions there assessed (governed membership, population fidelity, certified-contract conformance, determinism, fail-closed behaviour, certified-surface non-interference, identity/persistence neutrality, presentation-only consumption, `SNAPSHOT` vintage preservation).
3. The **six distinct statuses** of §7 of the accepted record, each at the determination there recorded.
4. The executed evidence of §§5–6 of the accepted record, at its recorded baseline `0ff644ed1a758b92bdec04eb0d9f6df46036bcbe`: platform suites `35/35` + `45/45` + `15/15` = `95/95`; product suites `7/7` + `7/7` = `14/14`; frontend `825/825`; platform `648/648`; typecheck and build exit `0`; the §6.2 negative/boundary matrix; §6.3 byte-stable determinism; §6.4 credential-free posture; and the §6.5 exact reproduction of all four certified digests (`NP12DEF v01`, `NP12EXE v01`, `NP12RES v01`, `G4 populationIdentity`) and `13/13` produced members identical to the certified `N4-A15` §4.2 table.

### 4.2 Scope limits carried in from the accepted record (unchanged)

- Acceptance is **scoped to the exercised paths**. The `500` last-resort transport branch was **not exercised** and is **not** accepted, qualified, or claimed.
- Acceptance is **non-production**. Production, deployment, live market data, and production identity are outside it.
- Acceptance of the product layer **does not** qualify any engine, extend the `N4-A16` certification envelope, or certify the `E2E-030` path.
- The accepted record's qualification is a determination by the recording agent on executed evidence. **This record is the Program Authority's acceptance of it** — the two remain distinct acts with distinct provenance, and this record does not convert the agent's determination into an agent-rendered acceptance.

---

## 5. Verified publication and closure history

Reused from the independently verified evidence already published in §16.1 and §16.4 of the accepted record and re-confirmed against the live remote at the decision baseline. **No completed investigation or test was repeated.**

| Item | Verified value |
|---|---|
| Publication pull request | **PR #71** — *"docs(integration): NP-12 Governed Screener product acceptance & qualification record (CANDIDATE — do not merge without separate authorization)"*; head `arena/cfcde1ce-iips-review-recovered`; base `main`; state **MERGED**; merged at `2026-10-13T04:44:30Z` |
| PR #71 merge commit | `ccef2215d6afecf18d61629fd0af363403f9f935` |
| PR #71 merge parents | First parent `0ff644ed1a758b92bdec04eb0d9f6df46036bcbe` (the accepted record's declared preparation baseline; root tree `30d23a54c980f7d6cce5255deb3f669ce9e4b150`) · Second parent `7f891a6a7c2d63034b8f966a206f0a135d29c013` (PR #71 head commit) |
| PR #71 merged tree | `a42165bcbd7f7d45947dc2830018ae5140a808b2` — byte-identical to the tree of the prepared commit `7f891a6a7c2d63034b8f966a206f0a135d29c013` |
| PR #71 changed-path scope | `A docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md` (`+400 −0`). Zero source, test, configuration, schema, frozen-artifact, or governance-decision files modified |
| Closure pull request | **PR #72** — *"docs(integration): record NP-12 Governed Screener post-publication closure note (PR #71)"*; head `arena/1b26ecba-iips-review-recovered`; base `main`; state **MERGED**; merged at `2026-10-13T05:01:03Z` |
| PR #72 merge commit | `61e0bc6ae13ee2c6579106c92d95abeb27bba956` — **the decision baseline of this record** |
| PR #72 merge parents | First parent `ccef2215d6afecf18d61629fd0af363403f9f935` (PR #71 merge commit) · Second parent `0e5066402d2797eb111203bf3426e9112028fada` (PR #72 head commit) |
| PR #72 changed-path scope | The same single file (`+67 −0`, purely additive §16). Zero other files modified |
| Post-publication closure disposition | `POST_PUBLICATION_CLOSURE=COMPLETE (2026-10-13)`; §15(2)–(4) **SATISFIED**; declared-baseline re-verification **CLOSED** with zero baseline drift (§16.2(2), §16.4) |
| Product-layer qualification disposition | **DETERMINED — QUALIFIED (non-production, exercised paths only)** — durably published on `refs/heads/main` (§16.2(4)) |
| Product acceptance disposition as published | **NOT EFFECTIVE — PENDING EXPLICIT PROGRAM AUTHORITY ACCEPTANCE OF THIS EXACT RECORD (§15(1) UNRESOLVED)** (§16.2(5), §16.4). **This act is that pending acceptance** |

---

## 6. Repository evidence at the decision baseline

All values below were verified live against the authoritative remote at preparation. None is inherited, assumed, or invented.

| Item | Verified value |
|---|---|
| Authoritative repository | `ramkivs/iips-review-recovered` (`https://github.com/ramkivs/iips-review-recovered.git`) |
| `origin/main` at the decision baseline | `61e0bc6ae13ee2c6579106c92d95abeb27bba956` |
| Root tree of `origin/main` | `4deb73ad8d67e24bddd75e7d02c0f3d2b204ed5b` |
| Merge commit parents of `origin/main` | `ccef2215d6afecf18d61629fd0af363403f9f935` + `0e5066402d2797eb111203bf3426e9112028fada` |
| Commit date of `origin/main` | `2026-10-13T05:01:03Z` (PR #72 merge) |
| Accepted record blob on `origin/main` | `d3f03ac3fd4ea57036a5de35b0704d308ead3de1` (`49,381` bytes; SHA-256 `6224db32ef405760116e2624d1c1b76857c609a7116e29aced8e144664cd8e01`) |
| Prior-main reference reconciliation | The previously reported main `61e0bc6ae13ee2c6579106c92d95abeb27bba956` was **re-verified live** and **remains current**; `main` did not move between the PR #72 merge and this decision. The historical value was treated as a reference, not an assumption, and no reconciliation of movement was required |
| Verification method | `git ls-remote origin refs/heads/main`; `git fetch origin --prune`; `git rev-parse origin/main`; `git rev-parse 'origin/main^{tree}'`; `git ls-tree -l origin/main -- <accepted record path>`; `git show 'origin/main:<path>' | head -c 38811 | sha256sum`; and the GitHub REST API (`repos/ramkivs/iips-review-recovered/commits/61e0bc6…`, `commits/ccef2215…`, `contents/<path>?ref=…`, `pulls/71`, `pulls/72`) |
| Session working state | Session branch `arena/631e49d0-iips-review-recovered` at `61e0bc6ae13ee2c6579106c92d95abeb27bba956`, working tree **clean** prior to this artifact |
| Shallow-clone note | The inspection clone is shallow. Commit-graph facts unavailable locally were obtained from the authoritative remote's read-only API. **No ref was moved and no tracked file was changed by that inspection** |

---

## 7. Satisfaction of §15(1) and time-scoping of superseded status statements

1. **§15(1) is satisfied by this act.** The Program Authority has reviewed and accepted *this exact record* (§3). Step 1 of the accepted record's effectiveness condition is therefore **SATISFIED** as of this decision.
2. **No in-place edit is made.** The accepted qualification record and its §16 closure note are preserved untouched (§10). Status supersession is effected **by declaration in this section**, following the same convention §16 itself used for the header `Status` row, §14, and §15.
3. **Time-scoped statements.** The following statements in the accepted record were accurate as at their preparation and publication points and are **retired as current descriptions of the acceptance state**, while remaining preserved verbatim in the file:
   - Header `Status` row: `NOT PUBLISHED — NOT EFFECTIVE` (as at preparation);
   - §7 row 6 and §14 `PRODUCT_ACCEPTANCE=NOT EFFECTIVE`, `EFFECTIVENESS=NOT EFFECTIVE` (as at preparation);
   - §15 pre-merge framing (as at preparation);
   - §16.2(5) `UNRESOLVED / PENDING — NOT EFFECTIVE` and §16.4 `PRODUCT_ACCEPTANCE=NOT EFFECTIVE …` / `REMAINING_GOVERNANCE_ACT=…` (as at post-publication closure).
4. **Current state after this act becomes effective.** `§15(1)` SATISFIED; `§15(2)–(4)` SATISFIED and remotely verified per §16.1; product-layer qualification DETERMINED — QUALIFIED (non-production); **NP-12 product-layer acceptance RECORDED and, on merge and remote verification of this act, EFFECTIVE for the stated non-production scope** (§11).
5. **Nothing else is superseded.** Every boundary, exclusion, deferred item, and preserved limitation of the accepted record continues in force unchanged (§8, §9).

---

## 8. Explicit exclusions and continuing limitations

Every limitation of the accepted record is preserved as a condition of this acceptance. **Acceptance is expressly subject to all stated limitations and exclusions.**

1. **`A6-IMPL-10` — Option B — producer convergence remains unauthorized.** OPEN and CRITICAL in the `A6` §14 specification register, independently confirmed OPEN — NOT SATISFIED by `A8` §5.10. Under `A9` §5.3–§5.4: no engine is claimed conformant; no conformance, certification, or release claim may be made about the `A6` contract for any engine; producer convergence requires its own gate; the inadmissible producer (`frontend/server/executive-transport.ts`) remains excluded and is not to be "fixed" opportunistically; **no engine change is authorized at all**. The `A12` pillar-sourcing rationale remains **cited, not adjudicated**; whether it discharges `A6-IMPL-10` is not determined by this act.
2. **`A8-S-03` — Option A — `COMPLETED` branch only.** `CLOSED / ACCEPTED — OPTION A APPROVED`, implementation authority **NONE GRANTED**; zero changes to `N4-A6`, `N4-A10`, or `N4-A13`. Structural failures fail closed before `executionId`/`resultId`; `FAILED` is lifecycle/error classification only; `INVALID_MEMBER` remains inside `COMPLETED`. No `FAILED`-branch result was emitted, hashed, or claimed, and this acceptance elevates nothing.
3. **`E2E-030` separation preserved.** The 13-engine `E2E-030` certification remains untouched (`0` diffs) and is **never** claimed to certify NP-12 or the Screen path (`N4-A13` §6.1; `D-N4-CERT-08`). This acceptance inherits, extends, or certifies nothing through `E2E-030`.
4. **Platform certification unchanged.** `N4-A16` (`D-N4-A16-CERT-01 = A`; `D-N4-A16-ACCEPT-01 = ACCEPT`) covers `N4-SD` + `N4-A10` + `N4-A13` only. `D-N4-CERT-03` **excludes UI and transport** from that envelope. This acceptance does not extend the envelope, re-run the certification, or add any layer to it.
5. **Identity, tenant, persistence, and IPD neutrality — no new authority.** The screener endpoint remains credential-free; no identity, tenant, credential, session, RBAC, multi-user, persistence, journal, store, schema, or IPD authority is created, inferred, or consumed. The endpoint remains outside the owner-context regime, and the unconditional `503 owner-context-unavailable` fail-closed safeguards on NP-06 Reports and G-2 Portfolios remain **untouched**. `F6_INVENTORY_AUTHORIZED` remains **UNDECIDED**. The IPD dependency pin remains `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`; no pin change, provider designation, or cross-repository mapping is made or implied.
6. **`SNAPSHOT` vintage and the non-production boundary.** Every accepted result carries the `SNAPSHOT` vintage `governed:program-v1.1-replay-baseline` (`dataVersion 1.1.0`). No live data is fetched, implied, or simulated. Production, production-readiness, deployment, release, tagging, and TD-7b remain **out of scope and deferred**.
7. **Governed membership invariant.** Membership authority is never delegated to the client: a request carrying `members` is rejected (`422 client-supplied-members-rejected`) and a client-supplied `populationIdentity` must match the server-derived identity exactly (`422 population-identity-mismatch`). The screened population is server-derived over exactly the 13 canonical screen sectors; an unresolvable sector or missing golden identity **throws** rather than substituting.
8. **Exercised-paths limit.** The `500` last-resort branch and any behaviour outside the exercised routes remain **not verified, not qualified, and not accepted**.
9. **NP-13 corpus boundary untouched.** `NP-12 STATUS = NOT DETERMINED` in `docs/integration/NP-13-D3-3-WORKSTREAM-MEMBERSHIP-DECISION-01.md` is **not modified** by this act. This acceptance is a **product-layer acceptance of a qualification record**; it is **not** an NP-13 composition, membership, admission, or candidate-eligibility determination, and it makes none. Whether it constitutes an admission act under any NP-13 framework is **not established here and is not claimed** (accepted record §11.8–§11.9).
10. **Documentation drift recorded, not corrected.** The accepted record's §14.3 disclosure (PR #47 described a `guardRead`/`401`–`403` fail-closed opening; the implementation after the global NO-AUTH change, PR #61 commit `1f7997e5e`, is credential-free) remains **disclosed rather than corrected**. Correcting it would modify source outside this act's scope.
11. **Deferred items remain deferred.** All ten deferred/unresolved items of the accepted record's §11 remain open exactly as recorded. None is resolved, advanced, or claimed by this acceptance.

---

## 9. What this acceptance does NOT authorize

This acceptance **does not** authorize, grant, establish, or imply any of the following. Each requires its own separate governance act and separate authorization:

- **Production use or deployment** — including production activation, production-readiness qualification, release, tagging, or any production artifact.
- **Live-data or live-vintage authority** — including live market data, live IdP evidence, or any departure from the frozen `SNAPSHOT` / `program-v1.1-replay-baseline` posture.
- **Producer convergence or engine conformance** — including any engine change, any claim that an engine conforms to the `A6` contract, and any discharge of `A6-IMPL-10`.
- **Identity, tenant, persistence, or IPD capabilities not already authorized** — including authentication, sessions, RBAC, multi-user authority, journals, stores, schema changes, an IPD pin change, or provider designation.
- **Any capability excluded by the accepted qualification record** — including the `FAILED` branch, the `E2E-030` path, extension of the `N4-A16` certification envelope, and the unexercised `500` branch.
- **Implementation authority of any kind.** This is a governance recording act. Zero source, test, configuration, schema, engine, adapter, transport, UI, fixture, frozen-artifact, or replay-baseline changes are authorized by it.
- **Promotion, main-admission of any other workstream, or NP-13 membership/admission determination.**
- **Any expansion of the accepted record's scope**, or any reinterpretation of a boundary recorded in it.

---

## 10. Non-actions and proof of non-interference

This record is a **single additive documentation file**. It:

- creates, modifies, and deletes **no** application, transport, UI, API-client, engine, adapter, certification, freeze-manifest, replay-baseline, or `.gitignore` file;
- **does not edit, rewrite, delete, re-render, or renumber** the accepted qualification record or its §16 post-publication closure note — both are preserved byte-for-byte intact at their published identities (§3);
- amends, supersedes, or reinterprets **no** governance decision; the §7 time-scoping is a declaration about status currency, not an edit of any record;
- creates **no** tag, release, or production artifact;
- reads, lists, inventories, or accesses **no** data;
- invents **no** signature, timestamp, decision, authority, evidence, or test result — every value in §§3, 5, and 6 was independently verified against the live authoritative remote, and the Program Authority's wording in §1 is reproduced verbatim.

---

## 11. Effectiveness condition and durability

In accordance with standing repository governance (`NP-12-N4-A15-AUTHORITY-DECISION-RECORD.md` §8.3 and `D-N4-CERT-10`; `docs/integration/IIPS_NP-12_N4_SCREEN_CERTIFICATION.md` §9; and the accepted record's §15), this act is a **candidate** with no operative effect until:

1. **Program Authority review and acceptance of the exact accepted record** — **SATISFIED** by §1 and §3 of this act (this is `§15(1)` of the accepted record).
2. **Explicit merge authorization by the Program Authority** — the Program Authority issued this acceptance decision together with the direction to record it as a distinct durable governance act and to publish it through the repository's normal merge mechanism. That direction is recorded here as the merge-authorization basis for this act. **No authority beyond that direction is claimed, inferred, or recorded.**
3. **Merge to `ramkivs/iips-review-recovered @ refs/heads/main`** — via pull request; **no direct push and no force-push**.
4. **Independent remote verification** of the merged commit SHA, parent SHA, root tree SHA, record blob SHA, and raw SHA-256 against the authoritative remote.

Until steps 3 and 4 are complete and verified, this act is **non-authoritative**, and NP-12 product-layer acceptance is **recorded but not yet effective on `main`**.

The publication coordinates of this act (its own merge commit, tree, blob, pull request number, and merge timestamp) **cannot be recorded inside the artifact that they contain**. They are therefore left to a **post-publication closure note** under the repository's established additive closure convention, as §15 of the accepted record itself provides and as §16 of that record demonstrates.

---

## 12. Status summary

```text
RECORD=IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-DECISION-01
RECORD_TYPE=PROGRAM AUTHORITY ACCEPTANCE DECISION / ATTESTATION (DISTINCT DURABLE GOVERNANCE ACT)
DECISION=ACCEPT
DECISION_VERBATIM=PRESERVED (§1 — not broadened, weakened, or reinterpreted)
ACCEPTANCE_AUTHORITY=RAMKI (RAMAKRISHNAN) — PROGRAM AUTHORITY — SOLE ACCEPTANCE AUTHORITY (D-N4-CERT-07)
DECISION_DATE=2026-10-13
ACCEPTED_RECORD=IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01
ACCEPTED_RECORD_PATH=docs/integration/IIPS_v3.0_NP12_GOVERNED_SCREENER_PRODUCT_ACCEPTANCE_AND_QUALIFICATION_RECORD.md
ACCEPTED_RECORD_BLOB_ON_MAIN=d3f03ac3fd4ea57036a5de35b0704d308ead3de1 (467 lines, 49381 bytes, SHA-256 6224db32ef405760116e2624d1c1b76857c609a7116e29aced8e144664cd8e01)
PUBLISHED_QUALIFICATION_BLOB=8209586fc9c515ab360bda91b202d5f378e9a0da (400 lines, 38811 bytes, SHA-256 c6518e510937af970630fe40d188dd50333587671f8c5c98a6a8a2de8ebb6ffd) — PRESERVED BYTE-FOR-BYTE AS BYTES 1..38811 (RE-VERIFIED)
SECTION_16_CLOSURE_NOTE=PRESENT AND INTACT (NOT EDITED, NOT DELETED)
ACCEPTED_SCOPE=NON-PRODUCTION NP-12 GOVERNED SCREENER PRODUCT LAYER — POST /api/screener + /screener (EXERCISED PATHS ONLY)
DECISION_BASELINE_ORIGIN_MAIN=61e0bc6ae13ee2c6579106c92d95abeb27bba956 (VERIFIED LIVE; UNCHANGED FROM PREVIOUSLY REPORTED VALUE)
DECISION_BASELINE_TREE=4deb73ad8d67e24bddd75e7d02c0f3d2b204ed5b
DECISION_BASELINE_PARENTS=ccef2215d6afecf18d61629fd0af363403f9f935 + 0e5066402d2797eb111203bf3426e9112028fada
PUBLICATION_HISTORY=PR #71 MERGED 2026-10-13T04:44:30Z @ ccef2215d6afecf18d61629fd0af363403f9f935 (+400 -0); PR #72 MERGED 2026-10-13T05:01:03Z @ 61e0bc6ae13ee2c6579106c92d95abeb27bba956 (+67 -0)
SECTION_15_1_PROGRAM_AUTHORITY_ACCEPTANCE=SATISFIED BY THIS ACT
SECTION_15_2_TO_4_PUBLICATION=SATISFIED AND REMOTELY VERIFIED (ACCEPTED RECORD §16.1)
PRODUCT_QUALIFICATION=DETERMINED — QUALIFIED (NON-PRODUCTION; EXERCISED PATHS ONLY)
PRODUCT_ACCEPTANCE=RECORDED BY PROGRAM AUTHORITY — EFFECTIVE ONLY ON MERGE OF THIS ACT AND INDEPENDENT REMOTE VERIFICATION (§11)
PLATFORM_CERTIFICATION=N4-A16 UNCHANGED (D-N4-A16-CERT-01=A; D-N4-A16-ACCEPT-01=ACCEPT); ENVELOPE=N4-SD + N4-A10 + N4-A13; UI AND TRANSPORT EXCLUDED (D-N4-CERT-03)
NOT_AUTHORIZED=PRODUCTION USE OR DEPLOYMENT; LIVE-DATA OR LIVE-VINTAGE AUTHORITY; PRODUCER CONVERGENCE OR ENGINE CONFORMANCE; UNAUTHORIZED IDENTITY/TENANT/PERSISTENCE/IPD CAPABILITIES; ANY CAPABILITY EXCLUDED BY THE ACCEPTED RECORD; ANY IMPLEMENTATION AUTHORITY
BOUNDARIES_PRESERVED=A6-IMPL-10 OPTION B (OPEN/CRITICAL); A8-S-03 OPTION A (COMPLETED BRANCH ONLY); E2E-030 SEPARATE; CREDENTIAL-FREE / NO PERSISTENCE / NO IPD; SNAPSHOT / NON-PRODUCTION; NP-13 CORPUS TOKEN UNTOUCHED
MUTATION=EXACTLY ONE NEW FILE (THIS RECORD)
MERGE=NOT PERFORMED AT PREPARATION
EFFECTIVENESS=NOT EFFECTIVE AT PREPARATION (§11 STEPS 3-4 OUTSTANDING)
```

---

*End of `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-DECISION-01`. It records the explicit Program Authority acceptance of `IIPS-V3-NP12-GOVERNED-SCREENER-PRODUCT-ACCEPTANCE-AND-QUALIFICATION-RECORD-01` for the non-production NP-12 Governed Screener product layer, preserves the Program Authority's wording verbatim, preserves the accepted record and its §16 closure note untouched, and grants no production, live-data, certification-extension, producer-convergence, identity, persistence, IPD, or implementation authority. It is not effective until §11 is satisfied.*
