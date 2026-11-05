# WS-A — Dhan 68-row import evidence set (IRR locus)

Owner repositories: **IRR** (preview, CAP-02 save boundary, import-evidence retention) and
**IPD** (format detection, parsing, identity resolution, P04 quarantine, durable holdings).

| File | Contents |
| :--- | :--- |
| `rows.json` | The 68 observed rows: verbatim names, each row's raw digit string, the numeric reading used, **every** alternative decomposition, explicit ISIN/exchange absence, and the observed run's counts, digest and refusal. |
| `dhan-web-ui-summary-68-reconstructed.csv` | The 68-row `DHAN_WEB_UI_SUMMARY_V1` surface used as the test fixture. |
| `identity-outcomes.json` | Output of the **actual** IPD pipeline for these 68 rows under (a) an empty `SecurityMaster` (the configuration the observed run used) and (b) the governed D05 master after the IPD correction. |
| `preview-outcome.json` | Output of the **actual** corrected IRR preview for the same 68 rows. |
| `evidence-record.sample.json` | The **actual** durable evidence record retained through the IRR PF-1 journal, read back and re-verified. |
| `tests-2026-11-05.txt` | Test transcript for the IRR side. |

## Provenance and limitations

* The observed run: `DHAN_WEB_UI_SUMMARY_V1`, 68 native rows, `PARSED_UNRESOLVED`, 0 resolved,
  68 unresolved, 0 saved, digest `468441dfd0264fddc1e8a7160ebc7c3e5239fa97d13c7545743d1500eb6264b1`,
  read at `2026-11-05T07:50:49.090Z`, refusal
  `Identity ambiguity detected for 'AGI GREENPAC': UNMAPPED_IDENTIFIER (No active mapping found for
  BSE_SYMBOL:AGI GREENPAC at asOf 2026-11-05T07:50:49.090Z)`.
* **The original CSV bytes were never retained by the running system**; only the digest was
  displayed. The reconstructed fixture therefore has its own digest
  (`c44e3cdb06e2d49f88c46d61867444f8a301cdf71a068b0e3aa1d748e6d52f31`) and no artefact here claims
  it equals the observed digest.
* ISIN and Exchange were blank in the observed surface; they are recorded as `null` everywhere and
  never invented. The numeric columns are a documented de-concatenation of each row's digit
  string, with all alternatives listed; identity acts on names/ISIN/exchange, so the identity
  conclusions do not depend on the chosen decomposition.
