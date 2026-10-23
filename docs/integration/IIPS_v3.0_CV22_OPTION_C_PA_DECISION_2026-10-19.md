# IIPS v3.0 — CV-22 Program Authority Disposition

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-CV22-OPTION-C-PA-DISPOSITION-2026-10-19-01` |
| **Existing work item** | `CV-22` — no new CV work-item identifier is created |
| **Decision-maker** | Program Authority (PA) |
| **Decision date** | `2026-10-19` (Asia/Kolkata; no time-of-day supplied) |
| **Decision source** | The PA's explicit instruction to the operating session on 19 October 2026, recorded without enlarging scope |
| **Status** | **DECIDED — DEFERRED; not accepted or complete** |
| **IRR baseline verified before preparation** | `main@75680333f232bebe25d8eb81d3c505ac3ee46ef9` |
| **IPD evidence baseline verified before preparation** | `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6` |

> **Rendered PA decision — CV-22: OPTION C — DEFER EXPANSION PENDING DEFINED PREREQUISITES.**
>
> This is the PA's selected disposition. Do not ask the PA to select this disposition again.

## 1. Decision and scope

CV-22 is **DEFERRED** under the PA's Option C disposition. The current IRR sector-reference behavior is preserved. This decision does not permanently reject D05 and does not authorize either the full D05 universe or an inferred “real-only” subset.

Until a later, explicit authorization:

- IRR's current 13-row sector-reference universe remains unchanged; an identifier outside that governed universe continues to fail closed under the existing IRR behavior.
- D05 remains a potential future source, not an admitted IRR owner-data universe.
- No eligibility may be inferred from names, identifier patterns, exchange listings, fixture conventions, source-reported aggregate counts, or IPD's resolver `sourceClassification: REAL` value.
- The proposed `CV-22-D05-REAL-EQUITY-IDENTITY-PROBE` is **not mandatory**. It becomes required only if a later PA decision expressly includes it in the selected acceptance criteria.
- No consumer acceptance, cross-repository integration, portfolio admission, qualification, production readiness, or overall Security Master capability completion is established by this record.

This disposition does not authorize fuzzy matching, fabricated identities, a new API/endpoint/service/database, changes to IRR watchlist behavior, or a change to portfolio persistence, admission, qualification, production-readiness, Group 1, Macro, Reports, or other unrelated boundaries.

## 2. Option-label reconciliation with the decision-input packet

The earlier decision-input packet, [`PKG-04-GOVERNED-UNIVERSE-CV22-DECISION-PACKET.md`](2026-10-18/PKG-04-GOVERNED-UNIVERSE-CV22-DECISION-PACKET.md), contains a historical alternatives table in which its original **Option C** is labelled “commission real-market coverage.” That packet was decision input, not the PA's authority record, and it also records that no option had yet been selected.

The PA has now supplied the operative wording **“OPTION C — DEFER EXPANSION PENDING DEFINED PREREQUISITES.”** This record preserves the earlier packet unchanged as history and makes the PA's exact current wording authoritative for CV-22. For avoidance of ambiguity, the earlier packet's Option C (“commission real-market coverage”) is **not selected**. The PA's present deferral does not select Option A or B from that earlier table, nor does it reject D05 permanently.

## 3. Prerequisites for any future expansion decision

No future expansion proposal may be treated as authorized until the following have been defined and approved for the specific consumer and scope:

1. **Authoritative identity and eligibility contract** — identify the governed identity levels and eligible/ineligible/unresolved states; state what source is authoritative and how exact identifiers and effective dates are interpreted. Do not derive eligibility from a display label or resolver classification.
2. **Approved roster and corpus revision** — specify the exact eligible roster, its authority, D05 corpus/version and content checksum, effective period, provenance, and treatment of omissions, corrections, and stale entries. A changing dataset is not an approved roster.
3. **Exact mapping to the relevant IRR identity** — identify the exact IRR consumer key for each approved record and the evidence for each mapping. Distinguish IRR's sector-reference `canonicalSecurityId` from a PIT `securityId` and from an IPD `companyId`; no equivalence is presumed.
4. **Explicit consumer acceptance criteria** — name the consumer boundary, observable behavior, exact/unresolved/effective-date cases, fail-closed cases, and the test or probe that constitutes acceptance. The `CV-22-D05-REAL-EQUITY-IDENTITY-PROBE` is optional unless the PA expressly makes it part of those criteria.
5. **Applicable implementation authority** — separately identify the repository, exact baseline, permitted file set, tests, scope limits, and implementation acceptance evidence. This decision grants no cross-repository implementation authority.

Until those prerequisites are met and an applicable authority act is recorded, **the current 13-row IRR sector-reference behavior is the accepted boundary for this work item**; the expansion capability itself remains deferred, not accepted.

## 4. Evidence and boundaries

The decision was prepared against the verified repository heads shown above. Supporting evidence includes:

- IRR [`frontend/server/executive-transport.ts`](../../frontend/server/executive-transport.ts) derives the watchlist provider's `canonicalSecurityId` from the sector reference; [`frontend/server/watchlists/watchlists-transport.ts`](../../frontend/server/watchlists/watchlists-transport.ts) resolves membership against that governed universe and returns `404 governed-row-not-found` for an unknown row. These are existing IRR behaviors, not new acceptance tests in this decision.
- IPD `main` includes the D05 broad-universe payload (2,250 records; checksum `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`) and its local UI08 implementation. Those facts do not establish an IRR identity map or IRR consumer acceptance.
- The current D05 payload does not expose a typed per-row real/synthetic eligibility discriminator. The resolver's `REAL` provenance value is not an eligibility contract.
- The identity and eligibility proposal published alongside this decision is explicitly **non-operative** and selects no schema names, identity semantics, or new implementation.

No IPD file or reference is changed by this IRR decision record. The separately authorized F-3 UI08 face-value/currency correction is not represented as completed or published here.

## 5. Durable status

The authoritative current disposition is this record. **The master tracker is intentionally not modified in this execution, per the latest instruction.** Its CV-22 row and counts therefore remain unreconciled and must not override this decision; no tracker-group movement or count reconciliation is claimed. The packet index and the additive notice below identify this record. The original packet remains preserved; its dated status statements are historical and are not rewritten as if this later PA decision had been made earlier.
