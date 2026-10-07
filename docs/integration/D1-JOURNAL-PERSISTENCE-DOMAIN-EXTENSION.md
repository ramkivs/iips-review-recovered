# IIPS — D-1 Journal Persistence Domain Extension

> **Record ID:** `D-1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION-01`
> **Decision:** D-1 extension — filesystem event-journal persistence recognized as a third, distinct
> governed persistence form (Watchlists / Collaboration / Settings)
> **Record type:** Governance decision — durably published; non-executable (grants no implementation,
> migration, promotion, admission, deployment, or production authority)
> **Date:** 2026-10-07 (UTC)
> **Authority:** Ramki — Program Authority / application owner. This decision is rendered under Ramki's
> explicit authorization for the bounded D-1 journal-persistence domain determination and its durable
> publication.
> **Recording agent:** Arena Agent Mode — preparation and verification only; no authority is rendered by
> the agent.
> **Authoritative repository:** `ramkivs/iips-review-recovered`
> **Authoritative ref:** `refs/heads/main`
> **Publication baseline:** `47edf6f3db79c6c443caed148121406f33a158b7`
> (tree `774f16b986e7e47aa74c92e7bdd477cc6a5cf6bb`)

## 1. Prior D-1 decision

D-1 Option C (IRR main merge `561cc85f…`, record blob `0c4f27b3…`, verified unchanged) assigned exactly
two persistence domains — Portfolio (G24 lineage) and Artifact/Report (store lineage) — as distinct,
non-interchangeable, non-universal. This extension amends nothing in D-1; D-1's scope, lineages,
boundaries, and exclusions stand exactly as recorded.

## 2. Investigation conclusion

The read-only journal investigation (351 branch @ `3b5c54c…`, merge-base `bfe85a7e…`) determined:
`DISTINCT GOVERNED PERSISTENCE FORM — D-1 EXTENSION REQUIRED`. No contradictory evidence was found;
the determination is adopted without reopening.

## 3. Extension decision

1. **Domain standing:** the filesystem event-journal persistence used by Watchlists, Collaboration,
   and Settings is a THIRD, DISTINCT GOVERNED PERSISTENCE FORM under the IIPS persistence governance
   model.
2. **Non-interchangeability:** it is NOT Portfolio/G24 persistence; it is NOT Artifact/Report/store
   persistence; it must not be silently substituted for either domain.
3. **Scope:** this extension applies ONLY to the journal persistence evidenced for Watchlists,
   Collaboration, and Settings (authority layer blob `ca735d5d…` + per-capability services/dirs on the
   investigation branch). It generalizes to no other IIPS persistence.
4. **Ownership:** domain-scoped `(tenantId, ownerUserId)` pairs, enforced per read/update/lookup. No
   universal owner/tenant authority is established.
5. **Identity:** D-2 preserved exactly — no cross-domain identity mapping, no CompanyId binding, no
   trust propagation.
6. **Storage technology:** the current journal form (IRR-local append-only NDJSON, version header v1,
   5-primitive in-process service) is recognized as evidenced; no universal NDJSON or storage-technology
   mandate is created.
7. **Lifecycle:** evidenced = append, read, read-state update, replay/load. NOT established as governed:
   deletion, reset, retention, archival, compaction. These remain governance gaps and must not be
   silently invented.
8. **Restart evidence:** same-process reload/replay = evidenced (tracked); separate-process restart =
   UNPROVEN. Implementation behavior is not certification evidence.
9. **Admission boundary:** domain standing ONLY. No main admission, no promotion authority, no
   implementation authority is granted by this extension.
10. **Future integration:** any bridge, migration, replacement, or cross-domain integration requires a
    separately governed decision and explicit authorization.

## 4. Lifecycle posture

- RETENTION: NOT YET GOVERNED. DELETION/RESET: NOT YET GOVERNED. COMPACTION: NOT YET GOVERNED.
  ARCHIVAL: NOT YET GOVERNED. RECOVERY: replay behavior evidenced; independent recovery certification
  not established. Future governance items, not implementation tasks of this act.

## 5. Qualification boundary

Watchlists acceptance record exists; the cited qualification record was not located; 77/77 remains
declared-only. **Watchlists qualification remains pending.** This extension grants no qualification to
any capability. Per-capability qualification must be independently evidenced.

## 6. Admission evidence bar

GOVERNANCE STANDING: established by this extension. IMPLEMENTATION: branch-only, unchanged.
QUALIFICATION: per-capability, independently evidenced. MAIN ADMISSION: requires a separate admission
act after reconciliation and verification. STRONGER CERTIFICATION: separate-process restart and
live-environment evidence remain unproven and are not silently treated as PASS.

## 7. Durability

Publication coordinates (recorded after independent verification):

- Repository: `ramkivs/iips-review-recovered`
- Ref: `refs/heads/main`
- Baseline main: `47edf6f3db79c6c443caed148121406f33a158b7`
- Branch: `governance/d1-journal-persistence-extension`
- PR: `PENDING`
- Merge commit: `PENDING`
- Tree: `PENDING`
- Record path: `docs/integration/D1-JOURNAL-PERSISTENCE-DOMAIN-EXTENSION.md`
- Blob: `PENDING`
- SHA-256: `PENDING`
