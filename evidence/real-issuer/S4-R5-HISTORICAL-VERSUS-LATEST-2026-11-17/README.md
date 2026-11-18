# `S4-R5` — historical availability versus latest-period readiness (2026-11-17)

**Item:** `S4-R5` of `docs/integration/IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md`.
**Record:** `docs/integration/IID-COVERAGE-AVAILABILITY-SEMANTICS-2026-11-17.md`.
**Authority:** IRR only. No issuer admitted, no dataset constructed, no source fetched, no production operation.

## What was run

Both served datasets were re-ingested from their committed ingest inputs at clock `2026-11-17T00:00:00.000Z`, then
read through `buildInvestmentCoverageReport` — the read model the `/investment/coverage/investment` endpoint serves.
No dataset was fetched, edited or re-published; the ingest inputs are the ones already committed under
`evidence/real-issuer/`.

| key | ingest inputs | dataset version |
|---|---|---|
| `S4R2-69bbc14e` | `S4-R2-INFOSYS-BORROWINGS-2026-11-17/ingest-input`, `WI7-CONSUMER-MARICO-2026-11-07/ingest-input`, `WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input` | `sha256:69bbc14e99ce…` |
| `ADMITTED-bdfb2527` | `REL-1-INFOSYS-2026-11-06/ingest-input`, `S4-R3-FILING-REFRESH-2026-11-14/ingest-input/{marico,kec}` | `sha256:bdfb2527389d…` |

## `runs/availability-by-issuer.json`

Per dataset: `availabilitySemantics`, the 13 sector rows (`stage`, `usable`, `withheld`), `existentialCheck`
(whether every served sector counter equals `measureCoverage`'s own — `true` on both), one entry per issuer with
`latestPeriodEnd`, `primaryMethod`, and the three disjoint method lists, and `htmlHasHistoricalLabel` (whether the
server-rendered view carries the relabelled counter — `true` on both).

### The finding, in one line

On `sha256:69bbc14e…`, **Marico Limited (Consumer)** reports `latestPeriodAvailable: [DCF_FCFF, PE_RELATIVE]` and
`earlierPeriodsOnly: [EV_EBITDA]`, while the Consumer **sector counter** reads **3 usable / 0 withheld**. The method is
historically available (FY2023 carries the borrowings the `NET_DEBT` derivation needs) and is **not** ready at the
newest Consumer period (FY2024). Both statements are correct; the report now states both, and no counter was changed.

| dataset | issuer (sector) | latest period | latest-ready | earlier-only | never available |
|---|---|---|---|---|---|
| `69bbc14e…` | Marico Limited (Consumer) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | **`EV_EBITDA`** | — |
| `69bbc14e…` | KEC International (Industrials) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA` | — | `EV_REVENUE` |
| `69bbc14e…` | Infosys Limited (Technology) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | — | `EV_EBITDA`, `EV_REVENUE` |
| `bdfb2527…` | Marico Limited (Consumer) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA`, `PE_RELATIVE` | — | — |
| `bdfb2527…` | KEC International (Industrials) | 2026-03-31 | `DCF_FCFF`, `EV_EBITDA` | — | `EV_REVENUE` |
| `bdfb2527…` | Infosys Limited (Technology) | 2024-03-31 | `DCF_FCFF`, `PE_RELATIVE` | — | `EV_EBITDA`, `EV_REVENUE` |

The `S4-R3` filing refresh makes Marico latest-ready for all three methods: the disclosure is dataset-sensitive, not
issuer-special-cased, and the same code reports both outcomes.

## What this bundle does not show

No valuation, no intrinsic, no assessment payload — `S4-R4`'s bundle
(`evidence/real-issuer/S4-R4-COVERAGE-VERSUS-VALUATION-2026-11-17/`) holds the assessment side, including the Consumer
`EV_EBITDA` refusal that this bundle explains. Nothing here is a host artefact and nothing here claims the population
is complete (`L-001`: 3 of 13 sectors) or current (`G-6` / `S4-R3`: all three issuers exceed the 200-day statement
window).
