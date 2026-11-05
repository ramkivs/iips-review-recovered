# Q-1 — NP-04 compatibility probe (2026-11-05)

**Purpose.** Answer Q-1 by execution rather than inference: does the pinned NP-04 governed
persistence foundation support the IID chain-scoping mechanism (non-portfolio scope tokens, one
independent artifact chain per subject, append-only supersession)?

**Verdict.** Supported. Fallback F2 is **not** required and is withdrawn. Recorded as §R-18 of
`docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` (Part II,
Revision 2), with the binding consequences in §5 below.

## 1. Isolation statement

- Every database is created inside a fresh `mkdtemp` directory and deleted on exit.
- No pre-existing NP-04 database, Reports store, owner-context carrier or persisted report was
  read, opened, migrated, modified or recreated.
- Owner pair used: `{ tenantId: 'probe-tenant', userId: 'probe-user' }` — synthetic, throwaway.
- No migration was applied to any path outside the temporary directory.

## 2. Subject under test

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-production-market-data` (IPD) |
| Commit | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` — the specifier IRR already depends on as `iips-np04-governed-persistence` |
| Module | `src/persistence/*` → publishes `./persistence` (`openDatabase`, `GovernedArtifactStore`) |
| IRR validator under test | `frontend/server/reports/artifact.ts` (`validateArtifact`, `validateArtifactChain`) at IRR `c40b713` |

## 3. How the recorded result was produced

`probe-result.json` in this directory is the verbatim stdout of one run of `probe.ts` under Node
`v22.22.3`, against a local copy of the pinned commit's `src/persistence/*.ts` executed with
`node --experimental-transform-types`. The only modification to that copied source was retargeting
relative `./x.js` specifiers to `./x.ts` so the Node type-transform runtime resolves them; no
statement was added, removed or altered. The in-repo `probe.ts` imports the published specifier
`iips-np04-governed-persistence/persistence` and the real IRR validator, and reproduces the same
eight results after `npm install`.

`node:sqlite` is the only runtime dependency of the subject; there is no native build step.

## 4. Checks and recorded results

| ID | Check | Result |
|---|---|---|
| P-1 | Non-portfolio scope-token acceptance (`co:…`, `hd:<pf>/<co>`, `icr:co:…`, `+`-form, bare `IN:ISIN:…`) | **Accepted.** All five tokens stored and round-tripped byte-identically in `portfolioId`. `:` and `/` are both safe. |
| P-2 | Duplicate `reportKey` on `createInstance` | **Permitted.** Byte-identical content twice ⇒ same `reportKey`, two distinct `reportId`s, two distinct `chainId`s, both `artifactVersion = 1`. No uniqueness constraint on `(owner, reportKey)`. |
| P-3 | `appendVersion` behaviour | **Head-only, single-parent.** Versions 1→2→3 on one chain, `chainId` stable, `supersedesReportId` points at the immediately prior version, prior row bytes unchanged. Appending to a non-head ⇒ `PersistenceSupersessionError`; unknown parent ⇒ `PersistenceNotFoundError`. `listSupersededBy` returns `current` v3 with history `[2, 1]`. |
| P-4 | IRR `validateArtifact` / `validateArtifactChain` over NP-04 rows | **Accepted** after the normalization the IRR adapter already performs (NP-04 carries `tenantId`/`userId` at top level; the canonical shape nests `ownership`). A spoofed owner pair is rejected. |
| P-5 | Independent chains for company / holding / change artifacts | **Independent.** Three scope tokens ⇒ three distinct `chainId`s; advancing the company chain leaves the other two at v1; `queryByOwner` returns all three; `listSupersededBy` is per chain. |
| P-6 | Validation + content-identity determinism | Empty `portfolioId` rejected (`PersistenceValidationError`); **whitespace-only accepted**; empty owner rejected; missing `canonicalPayload` rejected; falsy parameter values (`0`, `''`, `false`, `null`) accepted. `reportKey` is identical across separate stores and across parameter insertion order. |
| P-7 | Append with an unchanged `reportKey` | **Accepted** as v2. NP-04 does not suppress a no-op append, so the IID idempotency rule must live in the composer. |
| P-8 | Scope drift within one chain | NP-04 **permits** a version whose `portfolioId` differs from its parent's; `validateArtifactChain` **rejects** it (`reportType and portfolioId are fixed across a chain`). The IRR validator is the load-bearing check on both write and read. |

## 5. Design consequences (applied in the corrected design)

1. Scope tokens `co:`, `hd:`, `hc:`, `icr:` are used as designed; F2 surrogate scope IDs are not needed.
2. Because NP-04 accepts whitespace and has no format constraint, IRR validates scope tokens against
   `^[a-z]{2,4}:[A-Za-z0-9:+._/-]{1,120}$` and against a closed prefix set.
3. Because NP-04 permits duplicate content and no-op appends, the composer owns idempotency: it
   compares the incoming `reportKey` with the current head and returns `UNCHANGED` without writing.
4. Because NP-04 permits scope drift within a chain, `validateArtifactChain` runs on **write and on
   read**; a chain that fails validation is not displayed.
5. The new composition path must reuse the existing normalization in
   `frontend/server/reports/persistence.ts` (`toCanonicalArtifact`) rather than validating raw
   NP-04 rows directly.
