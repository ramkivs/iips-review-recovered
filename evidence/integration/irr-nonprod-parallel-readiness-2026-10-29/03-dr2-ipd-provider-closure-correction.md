# CAP-03 — DR-2 readiness: correction of the stale IPD-provider attribution in the 2026-10-29 readiness record

**Record ID:** `IIPS-V3-CAP03-DR2-IRR-READINESS-CORRECTION-2026-10-29-01`
**Repository:** `ramkivs/iips-review-recovered` (IRR). **IRR-only pass.** No IPD file, branch, PR or tracker was written.
**IRR basis:** `refs/heads/main` @ `e65e59e4f9ff0a21f119277f3904f1a08f517e28`, tree `4030b9d4578f653077f5a1f3a8dd3dd42eba935f`
**IPD basis (read-only):** `refs/heads/main` @ `188a4ff943175fe6338485706cca12da3b0735ff`, tree `79bc8e507735a37a128a28737269300164ad7a58`
**Companion:** corrective annotation inside [`01-readiness-verification-record.txt`](01-readiness-verification-record.txt) (block `CORRECTION 2026-10-29`); command transcript [`04-correction-verification-transcript.txt`](04-correction-verification-transcript.txt).
**Scope:** status correction of IRR-owned DR-2 readiness documentation and the direct checksum manifest. **No gate, fence, pin, write authorization, durability value, admission or runtime behaviour moved. No IPD mutation. Zero source or test files changed in either repository.**

---

## 1. The specific stale IRR statement

`01-readiness-verification-record.txt` (IRR, published 2026-10-29, blob `0505b7ee125d96ca627328854a2b0b2fe8a8ea67`) attributed an outstanding obligation to the IPD provider locus in two places. Both are quoted verbatim:

**Blocker list, item (1)** — under *"GENUINE REMAINING BLOCKERS for the read path (exact owners)"*:

> **(1) IPD-provider half of the envelope closure (IPD locus; then the recorded refusal paths in the new test flip only by a future authorized act)**

**Implementation findings:**

> … the remaining envelope gap requires the IPD-provider publication and a governance act, not an IRR code change.

**Why this is stale.** The IPD-provider half of the DR-2 / DQ-1 Option A read envelope was implemented, tested, merged and remote-verified by **IPD PR #89 on 2026-10-25** — four days *before* the readiness record was written. Recording it as outstanding invites duplicate IPD work against a closed gap and misstates the dependency of the read path.

## 2. Verified evidence that the provider half is closed

Every value below was re-read from the live remote in this pass; raw command output is in `04`.

| Fact | Verified value | Method |
|---|---|---|
| Implementing PR | **#89** — *CAP-03: implement DR-2 Option A IPD provider read envelope (7 values + isSaved lifecycle, fail-closed)* | `gh api …/pulls/89` |
| Head / merge | head `bc144b95649aec88c3bfd0fc2a9c68e828d4839a`; merge `79d06e3c5da60da2a234b7ac18c35df848bf9d11`; merged `2026-10-25T13:03:28Z` | `gh api …/pulls/89` |
| On IPD `main`? | **YES** — `compare 79d06e3c…main` → `status=ahead`, **44 ahead / 0 behind** | `gh api …/compare` |
| Provider source | `src/persistence/portfolio_store.ts` blob `540d49f2deb2c8d600b5b866675d145cf76a1e46` (34,084 B) — unchanged since the PR #89 merge | Contents API at `main` |
| Conformance suite | `tests/q1_ipc_read_contract_conformance.test.ts` blob `eddedd56449d6d0ac27dd394bd2a7262d0cb0c24` (61,324 B) — unchanged since the PR #89 merge | Contents API at `main` |
| Published evidence record | `evidence/cross-repository/IIPS_V3_CAP03_DR2_IPD_PROVIDER_ENVELOPE_VERIFICATION_2026-10-29.md`, blob `aac8ffa17e4c403c0698cec163aa57b18a03ab27` (16,149 B) | Contents API at `main` |
| Publishing PR | **#110** merged `2026-10-29T12:25:21Z`, merge `188a4ff9…`; change set is exactly two evidence files (`+88/-0` tracker, `+187/-0` record) — **no IPD source or test change** | `gh api …/pulls/110/files` |
| IRR adapter bytes examined | `ipcPortAdapter.ts` blob `1e20e98023f20f80ed61d8d32d070fdde677d3c7` — byte-identical to IRR `main` today | `git rev-parse HEAD:…` |

**Gap-matrix disposition.** The IPD verification record traces each element of IRR's frozen `V1_TO_G2_ENVELOPE_GAP` (`ipcPortAdapter.ts`) — **7 missing fields + 3 renames** — to the provider source and to an executed assertion: `weightSumPercentage`, `provenanceDigest`, `isSaved` on the summary and view; `totalMarketValue`, `provenanceDigest`, `holdingsCount` on `revisionEntry`; the renames `holdingsCount→totalHoldingsCount` and `committedAt→createdAt` correctly **not** applied provider-side (they belong to the IRR adapter). Result **10/10 CLOSED**, plus the "exactly seven additions, no extra field" assertion. Its independent cross-check compares IPD's replica of the IRR mapping rules against IRR's *actual* adapter source: **no drift**, so the conformance conclusions transfer to the live consumer.

## 3. What actually remains — governance, admission and authorization only

None of the remaining DR-2 closure dependencies is IPD provider-side.

| Remaining requirement | Owner | Verified state (unchanged by this pass) |
|---|---|---|
| Gate A′ / P-1 host provisioning | **PA → operator** | `NOT EXECUTED / UNSPENT / NOT AUTHORIZED`; P-1-C **NOT ESTABLISHED**; P-1-D **DESIGNATED, NOT VERIFIED FOR THE ATTEMPT** |
| Gate 5 route admission (`CV-52`) | **PA** | `NOT INITIATED / NOT ADMITTED`; twelve `/api/user-portfolios*` route-method pairs keep returning `503` owner-context-unavailable; composition root wires no Gate 3 module; `user-portfolio-transport.ts` remains blob `51704c12a467cd2f718a030b5036bc55c9afa73f` |
| DR-4r / DQ-3 populated contribution view | **PA** | **Refused by decision** — not a defect |
| DQ-4 final pin / freeze; H-12 | **PA** | No freeze exists; **H-12 NOT ADOPTED** |
| Result-acceptance acts for Gate 4 QE | **PA** | **NOT RENDERED**; QE `0/11`; Gate 4 `AUTHORIZED — NOT STARTED` |
| Write authorization / durability | **PA** | `WRITE_NOT_AUTHORIZED` and `SESSION_ONLY` / `durable:false` unchanged; no durable write path created, widened or exercised |

**Completed provider-side implementation and verified cross-repository conformance evidence are therefore separated from the remaining governance, admission and authorization requirements.** The first is a closed engineering fact; the second is an open authority set, each element of which still needs its own act. Neither is CAP-03 end-to-end closure, Gate 4 execution, result acceptance, durability acceptance, Gate 5 admission, or production eligibility.

## 4. Changes made in this pass (exact)

| Path | Change |
|---|---|
| `evidence/integration/irr-nonprod-parallel-readiness-2026-10-29/01-readiness-verification-record.txt` | Two additive, dated, bracketed in-place pointers at the stale statements (original wording preserved verbatim) + a terminal `CORRECTION 2026-10-29` block carrying the corrected blocker wording, the verified evidence, the remaining dependency set and the non-grants |
| `evidence/integration/irr-nonprod-parallel-readiness-2026-10-29/03-dr2-ipd-provider-closure-correction.md` | This record (new) |
| `evidence/integration/irr-nonprod-parallel-readiness-2026-10-29/04-correction-verification-transcript.txt` | Verification transcript (new) |
| `evidence/integration/irr-nonprod-parallel-readiness-2026-10-29/SHA256SUMS.txt` | Refreshed to cover `01`–`03` (`04` is self-excluded because it carries this check's own output, following the `blob-digests.txt` precedent); the two superseded digests are preserved verbatim in §6 below |

## 5. Deliberately not changed

- **No IRR tracker section.** The tracker's current DR-2 rows already attribute the provider half to IPD PR #89 as merged and published (top status row and §16.118), so no tracker correction is required for accuracy. Adding a tracker section would be governance-register work outside this correction's scope.
- **§18.1 row 30 flagged, not edited.** Its dated 2026-10-22 qualification note ("the IRR adapter refuses every v1 read result at the recorded v1→G2 envelope gap … which needs a governance act, not a code change") still reads as an open dependency at that dated state. The provider/gap limb is now satisfied and the remaining limbs are (a) Gate A′ execution, (b) the IRR-local precondition, Gate 5 admission and result acceptance. Routing that annotation to the governance/PA session follows the same convention as finding **F1** in `02-verification-transcript.txt`, which was likewise recorded and not edited.
- **No code, test, fence, contract, pin, lockfile, dependency, workflow, gate, authorization or runtime change; no IPD write; no IPD test re-run.** The completed IPD implementation and tests were not redone.

## 6. Provenance of superseded checksums

`SHA256SUMS.txt` as published 2026-10-29 (preserved here verbatim; `01` changed in this corrective pass, `02` is byte-identical):

```
dc160dfd9e67e6917e518b8d129a728622f13f4123cda5ff9080b1814ba967d5  01-readiness-verification-record.txt
cf0514c2aef73fcf8191493d582200822c5052debbc4f04891e2223afd5cc7e2  02-verification-transcript.txt
```

Superseded blob of `01`: `0505b7ee125d96ca627328854a2b0b2fe8a8ea67`. `02-verification-transcript.txt` is unchanged in both blob and digest, so its published integrity claim continues to hold.

## 7. Validation

| Check | Result |
|---|---|
| Scope of the working-tree change | Exactly the four paths in §4; **zero** `.ts`/`.tsx`/`.js`/`.json`/lockfile/workflow/fence/contract files |
| No stale attribution remains in the readiness folder | `grep` for the provider-outstanding phrasing returns only the preserved original text inside the dated correction markers and this record's quotations |
| Checksum manifest | `sha256sum -c SHA256SUMS.txt` → **3/3 `OK`** (`01`, `02`, `03`; `04` self-excluded, see §4) |
| Line endings / encoding | LF throughout, ASCII plus the characters already present in the file (no new non-ASCII introduced by the correction block) |
| Cross-repository facts | Re-read live from GitHub in this pass (§2); no value copied from an unverified claim |
| IPD read-only | No IPD write, push, PR, branch or test run in this pass |

Because the change set contains no source, test, configuration or dependency file, no compiler, suite or build result can be affected; the repository's CI runs unchanged against the same code state.

## 8. Verification register

| ID | Check | Result |
|---|---|---|
| `V-DR2-IRR-01` | Live baselines read before any action: IRR `main` `e65e59e4` / tree `4030b9d4`; IPD `main` `188a4ff9` / tree `79bc8e50` | **PASS** |
| `V-DR2-IRR-02` | IPD PR #89 identity and ancestry: merge `79d06e3c…`, merged `2026-10-25T13:03:28Z`, `ahead` 44 / behind 0 of IPD `main` | **PASS** |
| `V-DR2-IRR-03` | Provider source and conformance suite blobs at IPD `main` equal the PR #89 merge identities | **PASS** |
| `V-DR2-IRR-04` | Evidence record published by IPD PR #110; PR scope is two evidence files only; no IPD source or test change | **PASS** |
| `V-DR2-IRR-05` | IRR adapter bytes examined by that record (`1e20e980…`) are identical to IRR `main` | **PASS** |
| `V-DR2-IRR-06` | The stale attribution is isolated to `01` blocker (1) and the implementation-findings clause; no other IRR-owned DR-2 readiness reference states the provider half as outstanding (tracker DR-2 rows already record PR #89 as merged) | **PASS** |
| `V-DR2-IRR-07` | Correction applied additively: original text preserved verbatim, dated pointers in place, corrected wording stated | **PASS** |
| `V-DR2-IRR-08` | Remaining governance/admission/authorization requirements stated and unchanged | **PASS** |
| `V-DR2-IRR-09` | Change set scope and checksum manifest verified (§7) | **PASS** |
| `V-DR2-IRR-10` | Remote publication and post-merge read-back | recorded on the pull request page |

*End of record. Status attribution only. No implementation, no gate movement, no fence change, no write authorization, no PA decision, and no IPD write. The IPD-provider half of the DR-2 / DQ-1 envelope is **CLOSED**; the remaining DR-2 closure dependencies are **governance-, admission- and authorization-owned**, and remain open.*
