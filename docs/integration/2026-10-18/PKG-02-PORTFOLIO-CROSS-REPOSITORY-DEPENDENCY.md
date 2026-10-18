# PKG-02 — G-2 portfolio cross-repository dependency note

**Status:** evidence/decision input only; no Stage 5 act or implementation authorization.
**Date:** 2026-10-18.
**IRR main:** `9be364b11631291a8602e07fcbdd0c7a9cc6ed06`.
**IPD main:** `467eb529f52820032b17ea0212c92362a96dfe18` (verified clean shallow clone and remote `main`).

## Verified interface and current boundary

- IPD owns the user-portfolio domain and durable persistence boundary under the accepted G-2 decision; its current broker/Dhan ingestion is to be extended, not duplicated.
- IPD main's `frontend/src/features/portfolio/portfolioStorePort.ts` explicitly says the merged PR #8 increment is a session adapter over the existing in-memory `PortfolioStore`, with `durability: 'SESSION_ONLY'` and `durable: false`. Its act does not perform durable writes, identity acquisition, IPC, or G24 promotion. The current interface rejects caller-supplied owner/tenant/principal/credential/scope claims; unresolved identity is refused before mutation.
- The JSON-backed D05 asset is a governed build-time security master with manifest count `2,250`, checksum `7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5`, and authority reference `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`. IPD's current `BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT.md` distinguishes 52 real records from 2,198 synthetic Tier-2 records (indices 52–2249). D05's presence is not an IRR product-universe decision.
- IRR main has the `G-2` contract/port and user-portfolio UI/client, but the read seam remains `503` pending a separately designated non-authentication owner source. It does not authenticate, infer a tenant, or accept client identity.
- The registered `CV-20` next act is authority sequencing, not a new architecture choice: answer whether to authorize qualification of the existing bounded line and designate/decline the non-authentication owner source, or record a dated deferral. Stage 5 follows; it is not inferred by this note.
- `CV-52` admission is a separate later act. The G24/OIDC-bound branch is not a shortcut and remains subject to the existing D-1/main-admission boundary. The Group 2 local-principal IPC refs are distinct; do not conflate them with PR #8 or row 32.

## Required sequence and closure evidence

1. CV-20 Stage 4 decision: named qualification authority and ownership-source disposition (or dated deferral); no admission.
2. If authorized, Stage 5 bounded residual implementation only; no alternative persistence architecture and no IPD-owned code change from this IRR workstream.
3. Qualification: create → persist → restart → read; idempotent re-import; lineage/contribution preservation; fail-closed unresolved identity; exact-head test evidence.
4. Admission only through its separate authority act naming commits, evidence, scope, and fence changes. Until then, preserve IRR `503` and do not claim durable portfolio support.

Group 1 publication/Windows Gate C/result acceptance/promotion/Gate D/Gate E/CV-52 conditions are dependencies only where the selected lineage requires them. This note performs none of those acts and does not reopen Groups 1 or 2.
