# WS-A — pin-advance evidence set (IRR locus, 2026-11-05)

Evidence for advancing IRR's `iips-broker-import` dependency pin from `70b24f0` to the merged IPD
PR #127 commit **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`**, and for the end-to-end per-row
identity verification that the advanced pin makes possible.

Owner repositories: **IRR** (pin, consumption profile, materializer, preview reporting, evidence
journal) and **IPD** (format detection, parsing, identity assessment, P04 quarantine, durable
holdings, the D05 security master and its deposition process). **Zero IPD writes were performed.**

| File | Contents |
| :--- | :--- |
| `00-authoritative-remote-state.txt` | The resolved authoritative remote state: IPD PR #127 (source head `beb362d`, **merge commit `7bcae35`**, IPD `origin/main` tip = the merge commit), ancestry and distance from the retired pin, PR #127's content diff, the broker-import module tree at the merged commit, both pins' IPD publish surfaces, and the IRR baseline / PR #434 / PR #435 identities. |
| `01-pin-advance-diff.txt` | The complete IRR working-tree diff of the pin advance and its directly necessary integration references, captured before commit. |
| `02-materialization-receipt.txt` | How IRR actually consumes the advanced pin: `build:broker-import` output, the installed alias publish surface (`files: ["dist/package"]`), proof that **no raw IPD TypeScript source is present**, the materialized manifest, and byte-equality (SHA-256) between materialized and published artifacts. |
| `03-identity-assessment-68-row.json` | **The end-to-end result.** Every one of the 68 rows' individual identity outcome from the real pinned pipeline: `rowIndex`, verbatim source name, `identifierClass`, `identityStatus`, `identityRefusalCode`, the complete ordered `lookups[]` with outcomes and details, the quarantine record count and the exact `missingEvidence`; plus the pipeline's own `identitySummary`, the counts, the single whole-import refusal verbatim, and the not-performed decisions. |
| `04-evidence-record.json` | The **actual durable evidence record** retained through the IRR PF-1 journal in a throwaway OS temporary directory, read back and re-verified, with the retention/idempotency measurements (first retention, repeated retention, digest match, journal line count, foreign-owner invisibility). |
| `05-targeted-tests.txt` | Verbose transcript of the targeted subset: broker import, per-row identity assessment, refusal codes and the affected Reports/NP-04 integration — 11 files / 117 tests. |
| `06-typecheck-and-validation.txt` | `build:broker-import`, `npm run typecheck` (V2), `npm run typecheck:replay-server` (Stage A strict) and the CV-35 false-green guard. |
| `07-full-suite-and-build.txt` | `npm run test:ci` (V3) — 111 files / **1386** tests / 0 failed — the guard, and `npm run build` (V4). |
| `08-d05-coverage-probe.json` | The §4 investigation result: per-row determination of whether each of the 67 unresolved companies exists in the governed D05 corpus. **0 of 67 present.** |
| `09-d05-deposition-and-source-path.txt` | The IPD-owned D05 deposition process read verbatim at the pinned commit (operator-drop inventory, `d05_security_master_manifest.json`, the fail-closed policy header, the integrity test), the exhaustive `.csv` inventory of both repositories, and the IRR authorized acquisition path (browser-local file read; no broker login, no live API, no upload). |
| `generate-evidence.mts` | Reproducible generator for `03` and `04`. Runs the real preview and the real journal; writes nothing inside either repository worktree except those two files; never opens the authoritative operator data directory. |
| `probe-d05-coverage.mts` | Reproducible generator for `08`. Takes the unresolved set from the pipeline's own published assessment vector; reads the governed corpus the pinned alias publishes. |
| `SHA256SUMS.txt` | SHA-256 of every file in this set. |

The **independent post-merge remote read-back receipt** for the IRR PR that publishes this set is a
separate dated record, following the established IRR pattern (cf. PR #430 for the 2026-11-02
completed-work registers).

## Reproduce

```bash
cd frontend
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm install --no-audit --no-fund
npm run build:broker-import
npx tsx ../evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/generate-evidence.mts
npx tsx ../evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/probe-d05-coverage.mts
```

`NODE_EXTRA_CA_CERTS` is the recorded sandbox TLS-interception remedy for `codeload.github.com`
(same class as `XV-11` / `V252` / `V350`). TLS verification was never disabled.

## Commits used

| Repository | Commit | Role |
| :--- | :--- | :--- |
| IPD | `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` | **The pinned commit** — merge of PR #127, and IPD `origin/main` tip at resolution time |
| IPD | `beb362d4ca8fb0a4f86e383d1893d031df2638a8` | PR #127 source head (not the merge commit) |
| IPD | `b605a61458a655bb555c6f340332fcf77a85c870` | PR #127 base parent |
| IPD | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | The **retired** alias pin (2026-10-16), ancestor, 290 commits behind |
| IRR | `182580b33f9107f94d619cbfaf628fb88b67bd21` | Baseline `origin/main` (PR #435 merged) |

## Limitations recorded, not papered over

* The **original observed CSV bytes were never retained** by the running system; only the digest
  `468441dfd0264fddc1e8a7160ebc7c3e5239fa97d13c7545743d1500eb6264b1` was displayed. The fixture is
  a reconstruction with its own digest, and nothing here asserts equality with the observed digest.
* The numeric columns of the reconstruction are a documented de-concatenation of each row's digit
  string. Identity acts on names/ISIN/exchange only, so the identity conclusions do not depend on
  the chosen decomposition.
* **P04 quarantine record ids are process-specific** (`ident-quar-<epochMillis>-<random>`, minted by
  the IPD-owned pipeline). The ids in `04-evidence-record.json` are that run's own. The retained
  record is nonetheless stable where it matters: the journal dedups on `importId`, so the first
  retention is authoritative and a repeated import returns it unchanged with its original digest.
* **0 of the 67 unresolved companies exist in the governed D05 corpus**, so no `DHAN_DETAILED_
  HOLDINGS_V1` export could resolve them today. Nothing was invented to close that gap.
* The evidence generator writes to an **OS temporary directory** that it removes. The authoritative
  operator data directory was never opened, and **no real-user holdings save occurred**.
