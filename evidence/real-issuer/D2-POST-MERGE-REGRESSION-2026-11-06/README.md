# Post-D-2 Infosys regression — merged `b3987ef`

**Question this record answers:** after D-2 merged, does the original Infosys assessment still say exactly what the
Work Item 1 report published?

**Answer: yes — identical financial content, byte-identical payload.**

| | |
| --- | --- |
| Merged D-2 commit | **`b3987efad83eac87b4f5823e1800efe54b179b52`** ("D-2: nil-by-disclosure semantics for the canonical financial data representation (#487)") |
| PR | #487, squash-merged 2026-11-06T12:33:19Z, base `main` |
| Run against | `origin/main` at `b3987ef`, clean detached worktree (`/tmp/main-checkout`), dependencies installed with `npm ci` |
| Issuer | Infosys Limited, `IN:CIN:L85110KA1981PLC013115`, ISIN `INE009A01021`, Technology, consolidated Ind AS, FY2022–FY2024 |
| Input | **the original Work Item 1 input**, `evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input/` — not the withdrawn nil-declaration bundle |
| Input digest | `periods.csv` `sha256:e2cdba2042a55fc3352e85b8384e014f669e1472deb9011e7be2babd4fbc745c` |
| Dataset digest | **`sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e`** — identical to Work Item 1 |
| Artifact | `reportKey ed1e54b03e5e…`, `payloadDigest cc91f239197a…`, 42,800 bytes — identical to Work Item 1 v2 |

## 1. Four-component debt observation table

From `runs/assessment-summary.json` (capital structure, newest consolidated period 2024-03-31, `leaseTreatment`
`IND_AS_116_CAPITALISED`):

| Component | State | Value | Source | periodEnd | Aggregation treatment |
| --- | --- | --- | --- | --- | --- |
| `SHORT_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` | — (never `0`) | none: the statement presents no such row | 2024-03-31 | **blocks** gross debt |
| `CURRENT_MATURITIES_OF_LONG_TERM_DEBT` | `MISSING` / `NOT_REPORTED` | — | as above | 2024-03-31 | **blocks** gross debt |
| `LONG_TERM_BORROWINGS` | `MISSING` / `NOT_REPORTED` | — | as above | 2024-03-31 | **blocks** gross debt |
| `LEASE_LIABILITIES` | `PRESENT` (`AS_FILED`) | **83,590,000,000** (₹8,359 cr) | `INFY-INDAS-CONSOL-FY24` | 2024-03-31 | summed; the only debt component with a value |

Aggregates: `grossDebt` `MISSING` / `NOT_REPORTED` · `netDebt` `MISSING` / `NOT_REPORTED` — blocked, with no partial
total published. `cashAndCashEquivalents` 147,860,000,000 and `currentInvestments` 129,150,000,000 are `PRESENT`,
and `preferenceCapital` is `MISSING` / `NOT_REPORTED`; none of them changes the blocked outcome.

## 2. Coverage

`Technology` `G2_PARTIAL` — statement coverage 87.5 %, operating-metric coverage 0 %, 3 annual periods considered,
1 issuer considered.

| Method | Role | State | Reason |
| --- | --- | --- | --- |
| `DCF_FCFF` | PRIMARY | AVAILABLE | — |
| `PE_RELATIVE` | SECONDARY | AVAILABLE | — |
| `EV_EBITDA` | CROSS_CHECK | **WITHHELD** | `STATEMENT_INPUT_MISSING: NET_DEBT` |
| `EV_REVENUE` | CROSS_CHECK | **WITHHELD** | `MANDATORY_METRIC_MISSING: TM_NRR, TM_RECURRING_REVENUE_PCT` |

Identical to the Work Item 1 coverage report: usable 2, withheld 2.

## 3. Assessment and withheld outcomes

| Field | Post-D-2 result | Work Item 1 |
| --- | --- | --- |
| adequacy | `SUFFICIENT` | same |
| quality verdict | `MATERIAL_CONCERNS` | same |
| confidence | 0.4939, caps `STALE_DATA`, `DILUTION_PROXY` | same |
| `DCF_FCFF` | applicable, per-share `NOT_COMPUTABLE` / `NOT_REPORTED` (bridge blocked by net debt) | same |
| `PE_RELATIVE` | applicable, per-share `PRESENT` | same |
| `EV_EBITDA` | not applicable — "CAPITAL_STRUCTURE_INCOMPLETE: net debt is unavailable" | same |
| `EV_REVENUE` | not applicable — mandatory operating metric missing | same |
| `intrinsic` | **`null`** | same |
| `marginOfSafety` | refusal **`NO_PRICE_OBSERVATION`**, no conclusion | same |
| moat | `INSUFFICIENT_EVIDENCE` (ROIC − WACC `NOT_COMPUTABLE`) | same |
| risk aggregate | `NOT_COMPUTABLE` / `POLICY_INPUTS_UNAVAILABLE`, no factors | same |
| `netDebtToEbitda` | `NOT_COMPUTABLE` | same |

No valuation, no investment verdict, and no leverage/risk conclusion is produced. The one thing D-2 could have
changed — treating the absent borrowings row as a declared nil — is precisely what it must not do, and does not.

## 4. Original versus resulting artifact

| | Work Item 1 (`REL-1-INFOSYS-2026-11-06`) | This run (merged `b3987ef`) | |
| --- | --- | --- | --- |
| datasetVersion | `sha256:ca29c835…c6d71e` | `sha256:ca29c835…c6d71e` | identical |
| reportKey | `ed1e54b03e5e…` | `ed1e54b03e5e…` | identical |
| payloadDigest (v2) | `cc91f239197a1ed8aca52600ca25ec9c62cd78863e224756c21dfff7ba57cfcd` | same digest, recomputed on read | identical |
| payload bytes | 42,800 | 42,800 | identical |
| chain versions | 2 (v1 pre-lease, v2 final) | 1 | **differs — see below** |
| chain root reportId | `7220cfa4-…` (v2) | `83f55119-28cc-43ab-856c-8c5d6c5f1af2` | **differs — see below** |

Why the two metadata differences are legitimate and not concealment:

- **Version count.** The Work Item 1 chain recorded a first version before the ₹8,359 crore lease-liability column was
  added and a second after it, which is the defect-fix history that bundle documents. This run starts from the final
  input, so a fresh store produces one version. The chain head is compared against the Work Item 1 **v2** payload,
  which is the payload produced by that same final input.
- **reportId.** The chain root is a UUID minted per chain; this run used a scratch store
  (`/tmp/reg/store/investment.db`), so the root belongs to that store. Nothing about it enters the payload digest.

The payload digest is recomputed by `readVersionWithPayload` on read, so the equality above is checked against the
stored bytes, not taken from a manifest; the committed file's own `sha256` is the same value
(`runs/digest-comparison.json`).

## 5. Targeted checks on merged `b3987ef`

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` (`iips-platform`) | clear |
| `npm run test:iid` | **406 / 406**, 102 suites, 0 fail |
| `npx tsx --test tests/investment/nil-by-disclosure.test.ts` | 29 / 29 |
| `npx tsc -p tsconfig.investment-server.json --noEmit` (`frontend`) | clear |
| `npx vitest run server/investment` | 17 files / **205** tests pass |

Verbatim log: `runs/tests.txt`.

## 6. What was not touched

- `L-001` … `L-029` and D-3: unchanged. The merged register diff is a pure append (§14, §14.1); no entry's status,
  identifier, order or wording moved, and the §13 D-3 paragraph is byte-identical to `main` before the merge.
- The original Work Item 1 evidence: byte-identical (`git status --porcelain` over the bundle is empty), including
  `artifact/assessment-payload-v1.json` and `-v2.json`.
- The withdrawn D-2 nil declarations stay withdrawn: they live under
  `evidence/real-issuer/D2-NIL-BY-DISCLOSURE-2026-11-06/withdrawn/` with `WHY-WITHDRAWN.md`, and the D-2 bundle's
  `input/periods.csv` remains a byte-identical copy of the Work Item 1 input with no `NIL` cell.
- No valuation methodology, threshold, weighting or verdict rule changed; no price observation, no second issuer, no
  sector expansion, no new persistence mechanism, no IPD change.

## 7. Remaining qualification

The D-2 permission — a filer that *states* nil — is still not exercised by any real filing in this repository. This
issuer is silent, so the debt position stays blocked and the Work Item 1 qualification stands verbatim: the search,
identity, ingestion, assessment, composition and persistence path is validated on one real Indian listed issuer, not
the valuation of that issuer. Exercising D-2 on real data needs a filing whose borrowings note says the item is nil;
that is an open item, and no amount of representation work can manufacture it.

## 8. Files

| Path | What it is |
| --- | --- |
| `runs/ingest.txt` | ingest of the original Work Item 1 input on merged main |
| `runs/dataset-manifest.json` | manifest of the re-ingested dataset (`ca29c835…`, 0 issues, completeness 100) |
| `runs/coverage-technology.json` | Technology coverage entry: `G2_PARTIAL`, 87.5 %, usable 2 / withheld 2 |
| `runs/assessment-summary.json` | capital structure table, valuation, moat, risk, dividends, confidence, limitations |
| `runs/cli-persist.json` | composed and persisted artifact, dry-run-free, fresh store |
| `runs/chain-read.json` | independent read of the chain in a separate process |
| `runs/digest-comparison.json` | Work Item 1 versus this run, field by field, with the differences explained |
| `runs/tests.txt` | targeted checks on the merged commit |
| `runs/commands.txt` | exact commands and environment |
