# IIPS v3.0 — Platform Identity and Eligibility Contract Proposal

> **NON-OPERATIVE PROPOSAL.** Evidence-backed analysis only. This document does not create or amend a schema, identity hierarchy, eligibility meaning, API, endpoint, service, database, consumer integration, product behavior, implementation authority, or acceptance. It deliberately selects no new field or type names. The PA's current CV-22 decision is **Option C — defer expansion pending defined prerequisites**; nothing here advances that deferral.

| Field | Value |
|---|---|
| **Document type** | Non-operative cross-platform contract proposal |
| **Prepared** | `2026-10-19` (Asia/Kolkata) |
| **Related existing work item** | `CV-22` only; no new CV identifier created |
| **IRR evidence baseline** | `main@75680333f232bebe25d8eb81d3c505ac3ee46ef9` |
| **IPD evidence baseline** | `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6` |
| **Decision status** | No new PA decision rendered by this proposal; see the separate CV-22 Option C decision record |

## 1. Purpose and boundaries

This proposal records the evidence and unresolved design questions needed before security-master data could be safely interpreted across the IPD and IRR repositories. It is intended to prevent an identifier or classification from silently acquiring broader meaning when passed between domains.

The document does **not**:

- change IRR's current 13-row sector-reference behavior or authorize owner-data expansion;
- approve all 2,250 D05 records, an inferred real-only subset, or any other roster;
- treat IPD's `sourceClassification: REAL` as an eligibility fact;
- map an IPD `companyId` to an IRR sector-reference key or PIT `securityId`;
- authorize the proposed `CV-22-D05-REAL-EQUITY-IDENTITY-PROBE` as mandatory;
- add fuzzy matching, identity fabrication, an API, service, endpoint, database, watchlist behavior, or portfolio behavior;
- change portfolio persistence/admission/qualification, production-readiness, Group 1, Macro, Reports, or any unrelated boundary; or
- claim local UI08 correction, browser/Windows acceptance, hosted-service acceptance, or IRR consumer acceptance.

## 2. Verified evidence baseline

The review used the exact current `main` commits above. In the IPD worktree, `main` was clean at `be32d8c95a86b3f03bd382ccde5b6398efb351c6`; IRR remote `main` was verified at `75680333f232bebe25d8eb81d3c505ac3ee46ef9`. The evidence below describes those source trees, not an off-main lineage or a proposed future design.

### 2.1 Current IPD evidence

- The D05 broad-universe payload contains 2,250 records and has SHA-256 `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`, matching its manifest. The repository's reconciliation reports 52 real and 2,198 synthetic records, but the D05 row contract does **not** carry a typed per-row real/synthetic eligibility discriminator. The aggregate split is not a substitute for an approved row-level roster.
- `SecurityMasterEntity` in `src/identity/security_master.ts` includes `companyId` (commented as an “authoritative engine-compatible ID”), one `isin`, optional `cin`, company/display and industry/sector fields, one or more exchange listings, effective dates, and optional face value/currency. It is a combined current record shape, not a general issuer → security → listing → provider identity graph.
- `IdentityQuery`/`EffectiveDatedMapping` in `src/identity/mapping_store.ts` support typed `ISIN`, `CIN`, `NSE_SYMBOL`, `BSE_SYMBOL`, and `COMPOSITE_TICKER` values, with effective dates and an optional query `asOf`. Resolution normalizes case/outer whitespace and then compares identifier type and value; it does not perform fuzzy or name matching. If no active mapping is found, the resolver records `UNMAPPED_IDENTIFIER` quarantine; conflicting active matches to different `companyId` values record `AMBIGUOUS_COLLISION` and fail closed. Multiple active rows that all resolve to the same `companyId` do not produce a conflict.
- Mapping records do not carry source-authority/provenance or a source-priority rule. The current indexer applies entity effective dates to ISIN, CIN, and listing aliases; it does not define a general corporate-action, issuer-succession, identifier-reuse, or source-conflict adjudication model. An omitted `asOf` defaults to the current time.
- `src/transports/object_resolver.ts` produces a local descriptor with provenance, but currently hard-codes `faceValue: 1`, `currency: 'INR'`, and `sourceClassification: 'REAL'`. The D05 contract itself includes `faceValue` and `currency`; the resolver does not copy those two fields. A read-only diagnostic at the verified IPD `main` head resolved `NSE_SYMBOL:RELIANCE` to `EQ_RELIANCE_IN` and returned face value `1`/currency `INR`, while the D05 row contains face value `10`/currency `INR`. The same resolver stamps `REAL` regardless of which entity was resolved. This is a descriptor defect and a provenance limitation, not evidence of eligibility.
- The merged F-3 UI08 authority act is local to the `/security-master` surface and requires a full resolution descriptor including face value and currency, while retaining exact resolution, effective-date, ambiguity quarantine, and fail-closed behavior. It does not authorize an IRR consumer integration. The face-value/currency correction and its regression tests have **not** been published or completed in this IRR workstream.
- At the same verified IPD `main` SHA, prior baseline verification reported a successful TypeScript/build and 556 passing tests. Those existing tests are not IRR consumer acceptance, and the current `SM-05` surface assertion does not establish correct face-value/currency projection.

### 2.2 Current IRR evidence

- IRR's watchlist provider in `frontend/server/executive-transport.ts` sets `canonicalSecurityId` from the sector value. This is the existing governed sector-reference identity, not an IPD `companyId` or a per-security ID.
- `frontend/server/watchlists/watchlists-transport.ts` only admits a row found in that governed universe and returns `404 governed-row-not-found` for an unknown key. Its existing tests assert this fail-closed boundary.
- The distinct IRR PIT read contract in `frontend/server/pit/pitReadContract.ts` defines a security key shaped as `ISIN:<isin>:<series>`. The D05 entity contract contains an ISIN but does not define that IRR series-qualified key or a governed mapping to it.
- The existing D-2 identity/tenant decision keeps identity authorities domain-scoped. Its §3.2 explicitly says IPD `companyId` usage does not establish a universal company identity or user/company ownership binding. Neither D-2 nor G-2 provides a D05-to-IRR security mapping.

## 3. Identity levels that must remain distinguishable

The table is descriptive of evidence and open questions. It does not select a canonical hierarchy, schema, or mapping direction.

| Identity level or context | What current evidence represents | Boundary / unresolved point |
|---|---|---|
| Legal issuer or registered company | D05 has a display name and optional CIN on a record that also contains security/listing fields. | The current model does not define a standalone issuer identity or a governed issuer-to-many-securities relationship. The meaning and authority of any issuer-level identifier need explicit definition. |
| Security / instrument | D05 has an ISIN on each current record. IPD identity resolution returns the record's `companyId`. | The record shape does not establish a general one-to-many issuer/security graph, instrument class/series semantics, or a mapping from every `companyId` to each consumer's instrument key. |
| Exchange listing | D05 represents NSE/BSE listing symbols, optional BSE scrip codes, listing status, and listing attributes. | A symbol is exchange-contextual and may be renamed, reused, suspended, or delisted. The current mapping store applies entity-level dates; it does not document all listing-specific validity and corporate-action rules. |
| Provider-specific identifier | The current `IdentityQuery` has no provider namespace or provider identifier type. | Any broker/vendor key requires explicit source, namespace, scope, validity interval, and authority; it cannot be inferred from a ticker or name. No such general mapping is selected here. |
| IPD canonical record key | IPD calls `companyId` the authoritative engine-compatible ID for the record. | D-2 §3.2 limits the interpretation: it is not a universal company identity, a user identity, or an owner-binding key. Its security/issuer semantics beyond the current data contract remain bounded by that contract. |
| IRR governed sector-reference key | The current watchlist route uses a sector value as `canonicalSecurityId` for one of the existing 13 governed reference rows. | This is not equivalent to an issuer, ISIN, listing, or D05 `companyId`; no bridge is authorized by CV-22 Option C. |
| IRR PIT security key | IRR requires `ISIN:<isin>:<series>` at the PIT boundary. | A bare D05 ISIN is insufficient to construct the IRR key; series and exact mapping are unresolved. Do not infer the series. |
| User / owner / tenant identity | D-2 keeps these authorities domain-scoped; the D05 `companyId` concerns instrument/reference identity. | No security-master identifier may be reused as an owner, tenant, principal, or portfolio identity. |

A future contract would need to say which identity level each input, record, output, and consumer key denotes; whether and how relationships are one-to-many; and what happens when a relationship is absent, ambiguous, stale, or contradicted. Those semantics are not selected here.

## 4. Exact mapping, effective dates, and unresolved cases

### 4.1 Evidence-backed current behavior

The current IPD resolver is exact after normalization: type must match, and normalized identifier values must match. It accepts an optional `asOf`; the current implementation uses the current time if it is omitted. A mapping is active when the query time falls within its inclusive `effectiveFrom`/`effectiveTo` interval. Unknown or inactive identifiers fail closed rather than being guessed. Conflicting active mappings to distinct canonical records are quarantined.

### 4.2 Decisions a future contract must make

A proposal suitable for later PA review must define, without silently changing current behavior:

1. what exact identifier types and namespaces are accepted at each boundary;
2. whether normalization is allowed per identifier type, and its precise scope;
3. the authority, source and version of each mapping, not only its target;
4. mapping validity start/end rules, time zone, endpoint inclusivity, and treatment of missing or invalid `asOf`;
5. symbol reuse, identifier correction, exchange migration, listing suspension/delisting, corporate actions, and issuer/security succession;
6. deterministic handling of multiple sources that disagree, including which conditions require quarantine rather than a priority choice;
7. how a consumer-specific identifier is mapped without treating two domain keys as inherently equivalent; and
8. the observable fail-closed response and recovery workflow for missing, stale, ambiguous, or quarantined identities.

No name search, prefix match, fuzzy alias, identifier fabrication, guessed series, or resolver-label fallback is proposed. The existence of an `EXPIRED_EFFECTIVE_DATE` quarantine enum does not by itself define complete expired-mapping behavior; the current mapping store records no active match as `UNMAPPED_IDENTIFIER`.

## 5. Provenance, corpus revision, and eligibility

Identity resolution, data provenance, and universe eligibility are separate concepts and must remain separate in any future authority decision.

- A result should be traceable to an approved corpus/version and content checksum, mapping/source revision, exact input type/value, effective date/as-of, and the source record used. The current local descriptor carries a `dataVersion` and lineage digest, but the resolver's version is a fixed string and the D05 payload checksum/eligibility roster is not surfaced as a governed IRR-consumer contract.
- Eligibility must be represented by an authoritative, reviewed roster or a future PA-approved typed rule with defined authority and effective dates. The current D05 payload has no typed per-row real/synthetic discriminator. The repository's aggregate “52 real / 2,198 synthetic” reconciliation cannot safely identify which specific rows are eligible.
- `sourceClassification: REAL`, `quality: GOOD`, a company name, an identifier pattern, an exchange listing, or the fact that a row appears in a test fixture is not a substitute for a source-backed eligibility decision.
- A future roster must bind to a specific corpus revision/checksum and define how corrections, stale constituents, missing provenance, disputed classifications, and newly added records fail closed. It must not silently widen when the D05 dataset changes.
- Provenance should distinguish “where this record came from and which version was resolved” from “whether this consumer is authorized to use it.” A source classification must not double as an eligibility flag unless a separate authority expressly defines and governs that meaning.

No field name, enum, “real-only” rule, or eligibility algorithm is specified or selected by this proposal.

## 6. Consumer responsibilities and acceptance boundaries

### 6.1 Responsibilities

If a future, separately authorized consumer uses the security master, the producer/consumer boundary should make responsibilities explicit:

- The **IPD producer** should own the approved corpus revision, exact typed resolution rules, effective-dated mapping evidence, source provenance, and fail-closed handling for unknown/ambiguous source identities, within the authority granted to IPD.
- Each **consumer** should declare the identity level and domain key it accepts, supply the required as-of context, validate the returned identity/provenance/eligibility contract, and treat unresolved, stale, ambiguous, or ineligible results as non-usable rather than falling back to name matching or an older/unrelated key.
- A **cross-repository consumer** should map a resolved source identity to its own existing domain key only through an explicit, governed translation boundary. It must not reuse a sector key, PIT key, portfolio owner key, or IPD `companyId` by assumption.
- The **authority owner** should set the eligible roster and consumer-specific acceptance criteria before implementation. A green producer library suite alone cannot certify a consumer's mapping, display, persistence, or acceptance behavior.

These responsibilities are proposal principles only; they do not create a shared API or service.

### 6.2 Acceptance boundaries

| Boundary | Evidence that could be appropriate after separate authority | What it would not establish by itself |
|---|---|---|
| IPD identity resolver / descriptor | Tests for exact supported identifiers, effective-date boundaries, unknown and ambiguous fail-closed behavior, and exact descriptor fields projected from D05. | Eligibility of a row, an IRR identity mapping, UI/browser acceptance, or use by any consumer. |
| IPD local UI08 surface | Routed surface tests for the authorized full descriptor, including source face value/currency, and preserved exact/effective-date/fail-closed behavior. | D05 expansion in IRR, a “real-only” roster, or cross-repository consumer acceptance. |
| A future consumer adapter | Tests for each expressly approved consumer-key mapping and its unresolved/ambiguous cases at that adapter boundary. | Other consumers' mapping semantics or cross-product acceptance. |
| A future IRR product consumer, only if authorized | Tests at the actual selected IRR consumer boundary against the approved roster, exact mapping, as-of behavior, and refusal/unknown cases. A live probe is required only if the PA expressly selects it as acceptance evidence. | Browser, Windows, hosted-service, portfolio admission, production readiness, or acceptance outside the exact tested boundary. |

The consumer's acceptance criteria should name what is tested and where. A local library test can be sufficient for the library contract it exercises; it is not evidence of IRR consumer acceptance. Conversely, CV-22 Option C does not require a consumer integration or probe now.

## 7. Current maturity and open work

| Area | Evidence-backed state at the verified baselines | Current boundary |
|---|---|---|
| D05 data and local identity mapping | IPD `main` contains the 2,250-record dataset, exact identifier mapping, effective dates, and quarantine/fail-closed behavior. Prior same-SHA baseline reported 556 passing IPD tests and a successful build. | This is IPD-local implementation evidence. It neither defines row-level eligibility nor establishes an IRR mapping/acceptance. |
| UI08 local surface | F-3 authority covers the routed local UI08 surface and a full descriptor; the merged surface and resolver exist on IPD `main`. | Face value is currently returned as `1` instead of the D05 source value; currency is hard-coded as `INR`. For RELIANCE, D05 says face value `10` and currency `INR`. The defect and missing regression assertion remain; no correction, post-change test, build, or CI result is claimed here. |
| Eligibility and corpus governance | The D05 corpus checksum and aggregate composition are documented. | No typed per-row real/synthetic discriminator or PA-approved consumer-eligibility roster is present in the current D05 row contract. The resolver `REAL` label is not eligibility. |
| IRR consumer mapping | IRR keeps its 13 sector-reference rows and a distinct PIT `ISIN:<isin>:<series>` contract. | No D05-to-sector-key or D05-to-series-qualified-PIT mapping is established. CV-22 Option C defers expansion. |
| External acceptance | Existing source/tests and local route evidence can be inspected. | No claim is made for inaccessible consumer systems, live/browser/Windows operation, hosted services, or production use. |

The face-value/currency correction is independent of real/synthetic classification. A technically bounded future repair of the already-authorized local UI08 descriptor should project the existing D05 face-value and currency fields and add assertions that detect hard-coded output (for example, RELIANCE face value `10`/currency `INR`, plus a resolver-level currency pass-through case where the existing type permits it). It must retain exact resolution, effective dates, ambiguity quarantine, and fail-closed behavior. It must not use the correction to decide eligibility or modify IRR.

## 8. Decisions required before any future expansion

Consistent with the separate CV-22 PA decision, expansion remains deferred until all of the following exist for the proposed consumer:

1. an authoritative identity and eligibility contract;
2. an approved eligible roster bound to an exact corpus revision/checksum;
3. exact mapping evidence to the relevant IRR identity;
4. explicit consumer acceptance criteria, with the optional probe made mandatory only if expressly selected; and
5. applicable, repository-specific implementation authority.

A later decision may retain the 13-row universe, define another bounded scope, or authorize a specifically governed expansion; this proposal does not choose among those future outcomes. Until then, no expansion is authorized and no permanent rejection is implied.

## 9. Source references

### IRR

- `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — CV-22 register, capability matrix, and ordered progression.
- `docs/integration/2026-10-18/PKG-04-GOVERNED-UNIVERSE-CV22-DECISION-PACKET.md` — preserved decision-input packet; its original Option C label is historical and was not selected.
- `docs/integration/IIPS_v3.0_CV22_OPTION_C_PA_DECISION_2026-10-19.md` — current PA disposition.
- `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` §3.2 — IPD `companyId` is not universal identity or ownership binding.
- `frontend/server/executive-transport.ts`; `frontend/server/watchlists/watchlists-transport.ts` and its tests — current sector-reference behavior and fail-closed member lookup.
- `frontend/server/pit/pitReadContract.ts` — IRR PIT `ISIN:<isin>:<series>` identity contract.
- `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` — separate portfolio-domain boundary.

### IPD `main@be32d8c95a86b3f03bd382ccde5b6398efb351c6`

- `src/contracts/d05_security_master.ts` — D05 source contract.
- `src/identity/d05_broad_universe_data.ts` and its manifest — D05 corpus and checksum.
- `src/identity/security_master.ts`, `src/identity/mapping_store.ts`, `src/identity/quarantine.ts` — current record/mapping/quarantine evidence.
- `src/transports/object_resolver.ts` — current descriptor projection and provenance.
- `tests/shell_security_master_surface.test.ts` — existing UI08 surface tests; current face-value/currency assertions are insufficient.
- `evidence/target-shell-integration/PHASE-F3-UI08-SECURITY-MASTER-FUNCTIONAL-AUTHORITY-ACT.md` — F-3 local UI08 authority, including the full descriptor and preserved behavior.

## 10. Proposal status

This document remains **NON-OPERATIVE** unless a later authority expressly adopts a defined portion and provides the relevant implementation authority. It does not mark CV-22 complete, accept the D05 universe, decide identity/eligibility schema semantics, or complete the UI08 correction.
