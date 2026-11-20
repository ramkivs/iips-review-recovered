# S4-R3 Freshness Evidence — 2026-11-19 Re-measurement

*IID Stage 4 — S4-R3 Periods and Freshness (Data Supply + Proof). Append-only
successor to `evidence/real-issuer/S4-R3-FRESHNESS-EVIDENCE-2026-11-17/`; no
earlier record is modified. This record answers, at the 2026-11-19 clock,
whether any newer **authorised** filing data exists for Infosys, Marico, or
KEC International, re-verifies the O3-admitted candidate byte-for-byte, and
re-measures freshness under the unchanged policy. It does not install,
configure, operate, or accept anything.*

## 0. Boundaries

- **No freshness policy, assessment clock basis, or accepted period
  definition was changed.** The measurement uses the unchanged
  `freshness-policy/1.0.0` windows carried by `mos-policy/1.1.0`
  (`pnlDays: 200`, `balanceSheetDays: 250`), applied by the unchanged
  `assessFreshness` implementation.
- A recent **quarterly** observation is never used to claim an **annual**
  valuation basis is fresh. Annual bases and quarterly periods are reported
  separately throughout.
- Candidate verification is **not** installation, live verification, or
  acceptance. The re-verified candidate was built under `/tmp` outside the
  repository, is byte-identical to the candidate verified 2026-11-14 and
  operator-reported as built and verified on the Windows host 2026-11-15,
  and remains **not installed** on any host.
- No IPD repository file was created, edited, moved, or deleted; no pull
  request was merged; L-033 / G-15 published records are unmodified.

## 1. Newer authorised-data investigation (answer)

**No newer authorised filing period exists anywhere in the repository's
governed evidence.** Method: every committed `periods.csv` under
`evidence/` was inventoried for its latest period-end, and the repository
remote was confirmed at the published HEAD before measurement. Latest
period-ends by issuer are unchanged from the 2026-11-17 position:

| Issuer | Newest authorised period in evidence | Evidence of record |
|---|---|---|
| Infosys | FY2024 annual 2024-03-31 | `REL-1-INFOSYS-2026-11-06/ingest-input`; the only later Infosys input (`S4-R2-INFOSYS-BORROWINGS-2026-11-17`) is also FY2024 and is **not** covered by any O3 successor declaration |
| Marico | FY2026 annual 2026-03-31 | `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/marico` |
| KEC | Q2 FY2027 quarter 2026-09-30 (newest annual FY2026 2026-03-31) | `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/kec` |

The only evidence directory created after 2026-11-17 is the 2026-11-17
Infosys successor record above (already disclosed, unadmitted); the only
repository changes since are the L-033 (G-9) and G-15 publication commits,
which contain no filing data. Because no new filing is proposed, there is
**no new source-rights, admission, excerpt, or transcription-provenance
question to adjudicate**; the admitted corpus remains exactly the three
O3-admitted bundles.

**Exact blocker (unchanged in kind, precisely stated):** for every issuer
the December-half FY2027 quarter (and for Infosys additionally its FY2025
and FY2026 annuals / later quarters) has no authorised transcription in the
repository. S4-R3 cannot be evidenced complete until a fresh annual basis
exists, which under the unchanged 200-day window at 2026-11-19 requires an
annual period end on or after **2026-05-03** — i.e. in practice a filing
from the June/September 2027 fiscal-year cycle or an admitted FY2027 annual
— together with the O3/admission and installation evidence the programme
contract requires. No period or value was invented to fill this gap.

## 2. Candidate re-verification (2026-11-19)

Using the unchanged authoritative wrapper
(`iips-platform/src/investment/cli/build-s4-r3-candidate.ts`) at repository
HEAD `fe9f3b454e017586ce472447a6e74d5a961048f8`:

- **Build** into a new directory outside the repository: **PASS, 16/16
  independent candidate checks** (`runs/2026-11-19-candidate-build.json`).
- **Verify-only** on the same package: **PASS**
  (`runs/2026-11-19-candidate-verify-only.json`).
- Actual candidate digest == expected admitted digest:
  `sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`,
  byte-identical to the 2026-11-14 admitted candidate. The builder
  recomputed and verified **3/3 input bundles, 6/6 consumed files**, and
  the 26-entry file-level digest ledger; manifest content fields match the
  recorded expectation.
- Census verified: 3 issuers, 3 securities, 5 listings, **13 unique
  periods = 11 ANNUAL + 2 QUARTER**, 0 ingestion issues, 0 unsupported
  metrics/prices fabricated. `dataAsOf: 2026-09-30` (KEC Q2), completeness
  100%. Period ordering: Infosys annuals 2024→2022, Marico annuals
  2026→2022, KEC annuals 2026→2024 plus quarters 2026-06-30 and 2026-09-30
  (consecutive Q1→Q2 FY2027).

## 3. Freshness at the 2026-11-19 clock (before / after)

Measured with `readDataset` + `selectSeries` + `assessFreshness` over the
re-verified candidate dataset (`runs/2026-11-19-freshness.json`), against
the 2026-11-17 ledger values. The +2-day deltas are clock arithmetic only;
the underlying supply did not change.

| Issuer | Annual valuation basis (period end / filed) | Age 2026-11-17 → **2026-11-19** | Status | Newest quarterly period | Sequence gaps |
|---|---|---|---|---|---|
| Infosys | FY2024, 2024-03-31 / 2024-04-18 | 961 → **963 days** | **STALE** (`VALUATION_BASIS_BEYOND_PNL_WINDOW`) | none admitted | 0 |
| Marico | FY2026, 2026-03-31 / 2026-05-05 | 231 → **233 days** | **STALE** (same reason) | none admitted | 0 |
| KEC | FY2026, 2026-03-31 / 2026-05-16 | 231 → **233 days** | **STALE** (same reason) | **Q2 FY2027, 2026-09-30 / 2026-11-02, 50 days**, consecutive after 2026-06-30 | 0 |

Determination notes:

- All three annual valuation bases exceed the unchanged 200-day profit-and
  -loss window; the last permissible annual period end was **2026-05-03**.
  Filing dates (April/May) are recorded as publication facts and do not
  extend the period-end window — no issuer's status changes.
- KEC's newest quarterly period is usable and correctly sequenced (two
  consecutive fiscal quarters, zero sequence gaps) and is reported as its
  **latest reported observation**, separate from its valuation basis. It
  does **not** make KEC's FY2026 annual valuation basis fresh.
- No missing-period or sequence-gap remains in any admitted series;
  gaps are reported, never interpolated.

## 4. Tests and regression (2026-11-19)

- Freshness suites (`s4r3Freshness.test.ts`, incl. FRESH/STALE/UNKNOWN,
  fallback-basis, and sequence-gap cases): **23/23 pass**.
- Full IID regression (`npm run test:iid`): **1668/1668 pass**, 0 failures.
- Platform typecheck (`tsc --noEmit`): **PASS**.

## 5. Status disposition

- **S4-R3: OPEN.** The quarterly-presence limb remains satisfied by KEC;
  the freshness limb fails for all three issuers at the 2026-11-19 clock,
  with unchanged policy, and no newer authorised filing supply exists to
  admit. The stale-data limitation is retained (L-043 remains open).
- **S4-R3-Infosys: OPEN (separate residual).** No newer supported Infosys
  filing is available; its latest authorised period remains FY2024
  (2024-03-31). It is not closed, and is not affected by any other issuer's
  refresh.
- Capability delivery (freshness implementation and tests), candidate
  verification, installation/live verification, and acceptance remain four
  distinct states: the first two are evidenced; **installation/live
  verification and acceptance are not claimed.**

## 6. Artifact digests

See `digests.json` (beside this README) for the SHA-256 digest and
pipeline-output digest of every file in this directory. The re-verified
candidate bytes themselves live outside the repository and are exactly
reproducible from the three committed O3-admitted inputs via the pinned
build clock `2026-11-14T00:00:00.000Z` — reproducibility, not the sandbox
path, is the evidence.
