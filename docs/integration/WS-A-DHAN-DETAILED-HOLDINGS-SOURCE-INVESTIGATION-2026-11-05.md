# WS-A §4 — Can `DHAN_DETAILED_HOLDINGS_V1` authoritatively resolve the 67 unresolved rows?

**Record:** `WS-A-DHAN-DETAILED-HOLDINGS-SOURCE-INVESTIGATION-2026-11-05`
**Type:** INVESTIGATION ONLY. **No mapping was created, deposited, inferred or guessed.**
**Owner repository:** `ramkivs/iips-review-recovered` (IRR) for this record. The D05 security
master and its deposition process are **IPD-owned**; IRR performed **zero IPD writes**.
**Pinned authority investigated:** `iips-broker-import` @ `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`
(IPD PR #127 merge commit).

## VERDICT

**BLOCKED — the identifiers were NOT obtained and NOT deposited. The 67 rows remain
`NO_AUTHORITATIVE_IDENTIFIER_MATCH`.** Two independent limitations, each sufficient on its own:

1. **The source is not accessible through any authorized acquisition path in this session.**
2. **Even with the source, 0 of the 67 companies exist in the governed D05 corpus** — so there is
   no governed entity for an ISIN or an exchange-scoped symbol to resolve *to*.

## 1. Is `DHAN_DETAILED_HOLDINGS_V1` supported by the pipeline?

**Yes — parsing is not the gap.** The IPD Dhan adapter governs two variants
(`adapters/dhan-holdings-adapter.ts` at the pinned commit):

```text
DHAN_DETAILED_HOLDINGS_V1 : Trading Symbol, ISIN, Exchange, Total Qty, DP Qty, Available Qty,
                            Average Buy Price, Last Traded Price, Current Value, Profit / Loss, P&L %
DHAN_WEB_UI_SUMMARY_V1    : Name, Quantity, Avg Price, Last Traded, Investment, Current Value,
                            P&L, P&L %
```

The adapter reads `ISIN` and `Exchange`, upper-cases the ISIN, maps the exchange to `'NSE'|'BSE'`,
and the identity assessment classifies such a row as `ISIN` (queried first and alone) or
`EXCHANGE_SCOPED_SYMBOL` (only the declared exchange's namespace queried). This was verified
behaviourally, not just by reading source — see §5.

## 2. Is the source accessible through an existing authorized acquisition path?

**No.** The complete inventory of authorized broker-CSV acquisition in this product is a
human-supplied local file read in the browser:

| Fact | Evidence |
| :--- | :--- |
| Acquisition is `File.text()` on a user-selected local file, 1 MiB cap | `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` |
| "No broker login or live API connection." | same file, rendered copy |
| "Files are processed in this browser only, not uploaded or stored." | same file, rendered copy |
| "No Dhan HTTP client, API endpoint, account login, token acquisition…" | `docs/integration/DHAN-BROKER-CONVERGENCE-IMPLEMENTATION-2026-10-16.md` §"XLSX explicitly deferred" |
| Sandbox egress is restricted to `github.com`, `codeload.github.com`, `api.github.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org` | session environment; no Dhan host is reachable even if a client existed |

**No `DHAN_DETAILED_HOLDINGS_V1` artefact exists in either repository.** Exhaustive `.csv`
inventory at the pinned commits:

```text
IPD  @ 7bcae35 : evidence/cross-repository/artifacts/IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-23.csv
                 evidence/integration/ws-a-dhan-68-row/dhan-web-ui-summary-68-reconstructed.csv
IRR  @ main    : governance/tracking registers only, plus
                 evidence/integration/ws-a-dhan-68-row/dhan-web-ui-summary-68-reconstructed.csv
                 frontend/server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv
```

Both Dhan artefacts are the **Web UI summary** surface. The observed run that produced the 68 rows
was `DHAN_WEB_UI_SUMMARY_V1`, its original bytes were never retained by the running system (only
the digest `468441df…6264b1` was displayed), and no detailed export was ever supplied.

Transcript: `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/09-d05-deposition-and-source-path.txt`.

## 3. Would a detailed export resolve the 67 rows against the *current* governed corpus?

**No — 0 of 67.** This is the decisive finding, and it was measured against the governed corpus the
pinned alias actually publishes (`src/identity/d05_broad_universe_data.js`, consumed byte-for-byte
from `.cache/broker-import`), never against a model of it.

Reproducible probe: `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/probe-d05-coverage.mts`
→ `08-d05-coverage-probe.json`.

```text
governed D05 corpus entities             : 2250
distinct ISINs in the governed corpus    : 2250
source revision                          : BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001
                                           :7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5
unresolved rows probed                   : 67   (taken from the pipeline's own assessment vector)
present in the governed D05 corpus       :  0
absent from the governed D05 corpus      : 67
reference: AGI GREENPAC (row 1)          : present via a governed listing-symbol alias — the one
                                           resolved row of the 68
```

The probe is deliberately **wider** than the governed master — it compares upper-cased,
non-alphanumeric-stripped company names, listing symbols, `nseSymbol` and `bseSymbol` — precisely
so that a negative result is conclusive. The master itself resolves on **exact** keys only. A
corpus that contains no entity for a company cannot resolve that company's ISIN, because an ISIN
lookup resolves *to an entity*.

The 67 rows therefore need **both** (a) a detailed export supplying an ISIN or an exchange-scoped
trading symbol per holding, **and** (b) a governed D05 deposition of those entities. (b) alone
would not help without (a); (a) alone provably does not help without (b).

## 4. Could the mappings be deposited into D05 through its established process?

**Not by IRR, and not in this session.** The established process is IPD-owned and
authorization-act-governed:

| Element of the established process | Authoritative source (read-only) |
| :--- | :--- |
| Deposition locus | IPD `evidence/operator_drop/d05_security_master_broad_universe.json` + `d05_security_master_manifest.json` |
| Deposition identity | `batchId BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001`, `fileChecksumSha256 7f53540b…a2b74b5`, `recordCount 2250`, `droppedAt 2026-09-22T06:00:00.000Z`, `operatorId OPERATOR_ADMIN_GOVERNED_01` |
| Authorization | `authorizationRef AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001` |
| Integrity binding | IPD `tests/d05_security_master_integrity_semantics.test.ts` enforces equality with the manifest **and** with the SHA-256 of the deposited JSON |
| Fail-closed policy | IPD `src/identity/governed_fixture_master.ts`: "Real-world broker securities not present in this authoritative master are deliberately LEFT UNMAPPED… Under NO circumstances are identifiers fabricated or inferred via fuzzy matching." |

A deposition changes the corpus, its `fileChecksumSha256`, its `recordCount` and therefore the
`masterRevision` that every identity assessment reports. It requires a new IPD authorization act,
the operator drop itself, and re-binding of the IPD integrity test. **IRR has no write path to any
of that and attempted none.** No new authorization act for a D05 expansion was found in either
repository.

## 5. What was verified behaviourally at the pinned commit (exchange scoping)

`frontend/src/api/brokerHoldingsPreview.test.ts` now proves, against the real pipeline:

| Surface supplied | `identifierClass` | Namespaces queried, in order |
| :--- | :--- | :--- |
| `Exchange=BSE`, no ISIN | `EXCHANGE_SCOPED_SYMBOL` | `['BSE_SYMBOL']` only |
| `Exchange=NSE`, no ISIN | `EXCHANGE_SCOPED_SYMBOL` | `['NSE_SYMBOL']` only |
| `ISIN=INE999Z99999` | `ISIN` | `['ISIN']` only |
| Web UI summary (no ISIN, no exchange) | `UNSCOPED_NAME_OR_SYMBOL` | `['NSE_SYMBOL','BSE_SYMBOL']` verbatim |

A BSE row is never resolved or reported through NSE, and vice versa. The identifier value is used
**verbatim** on every lookup (`l.identifierValue === row.symbol` is asserted for all 67 unresolved
rows). A row already resolved by an earlier authoritative lookup records the remaining namespaces
as `Not queried: the row was already resolved by NSE_SYMBOL.` — no weaker identifier re-derives a
resolved identity, and no speculative fallback is presented as a result.

## 6. What was NOT done, explicitly

* No ISIN was guessed, looked up externally, pattern-matched (`INE…`), or derived from a name.
* No symbol was inferred from a company name, and no name was compacted into a symbol and asserted.
* No fuzzy, similarity, edit-distance or token-overlap matching was used for anything.
* No synthetic or placeholder mapping was deposited anywhere.
* No row was reported as resolved without a row-level pipeline outcome.
* No IPD file was created, modified or pushed.

## 7. Exact limitation and the only path that would close it

**Limitation.** For each of the 67 rows the authoritative evidence that would be required is an
**ISIN (preferred)** or an **exchange-scoped trading symbol**, taken from the account holder's own
`DHAN_DETAILED_HOLDINGS_V1` export. That export does not exist in either repository, cannot be
fetched (no broker connection exists and no Dhan host is reachable), and — even if supplied —
would resolve **0 of 67** against the current governed corpus.

**Only closing path (ordered, all IPD/PA/operator-owned):**

1. The operator supplies their own `DHAN_DETAILED_HOLDINGS_V1` CSV locally through the existing
   browser file path (no upload, no new acquisition code).
2. The pipeline assesses it; rows whose ISIN/exchange-scoped symbol is already a governed exact key
   resolve immediately. Measured expectation today: still 0 of 67, plus whatever the governed
   corpus already holds.
3. For the remainder, a **new IPD D05 deposition** under a new authorization act, with the
   identifiers taken verbatim from the operator's own export and from an authoritative listing
   source, re-binding `d05_security_master_manifest.json` and
   `tests/d05_security_master_integrity_semantics.test.ts`.
4. Re-run the 68-row (or detailed-export) identity assessment after any valid deposition and
   re-publish the evidence.

Until step 3 completes, **the correct and only truthful state is 67 rows unresolved**, the whole
import refused under P04 / DP-2 Option 2F, and zero holdings saved.

## 8. Row-level status of the 67 unresolved holdings

Full row-level evidence — every row's `rowIndex`, verbatim source name, `identifierClass`, both
recorded lookups with outcomes and details, refusal code, quarantine record count and the exact
missing-evidence statement — is in
`evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/03-identity-assessment-68-row.json`
(68 entries) and `08-d05-coverage-probe.json` (the 67, with the corpus-coverage determination per
row). The retained durable record with per-row refusal codes and quarantine ids is
`04-evidence-record.json`.

Summary: rows 2–68 (all names from `ASK AUTOMOTIVE` through `WEBSOL ENERGY SYSTEM`), each
`identifierClass = UNSCOPED_NAME_OR_SYMBOL`, `status = UNRESOLVED`,
`refusalCode = NO_AUTHORITATIVE_IDENTIFIER_MATCH`, two recorded lookups
(`NSE_SYMBOL` then `BSE_SYMBOL`, both `UNMAPPED_IDENTIFIER`, each with its own P04 quarantine
record — 134 quarantine records in total), and `missingEvidence` naming the ISIN or an
exchange-scoped trading symbol as the required evidence. **0 of 67 present in the governed D05
corpus.** None is claimed as resolved.
