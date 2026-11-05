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

## IPD correction — PUBLISHED (dated addendum, 2026-11-05)

> **STATUS CHANGE.** The correction preserved below is **no longer unpublished**. It was
> re-authored on an IPD session branch with write access and merged as IPD
> **[PR #127 — Fix Dhan broker holdings per-row identity assessment](https://github.com/ramkivs/iips-production-market-data/pull/127)**:
>
> | Item | Value |
> | :--- | :--- |
> | Source branch | `arena/ws-a-dhan-68-row-identity-20261105` |
> | Source (head) commit | `beb362d4ca8fb0a4f86e383d1893d031df2638a8` |
> | **Merged commit** | **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`** — also IPD `origin/main`'s tip |
> | Base parent | `b605a61458a655bb555c6f340332fcf77a85c870` |
> | Merged at | `2026-11-05T08:43:30Z` |
>
> IRR's `iips-broker-import` pin has been advanced to that merged commit and the end-to-end 68-row
> per-row identity result re-measured: see
> `../ws-a-dhan-68-row-pin-advance-2026-11-05/README.md` and
> `docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md`.
> The files in *this* directory are preserved **as the historical record of the blocked pass** and
> are not regenerated: their `identity-outcomes.json` was produced by the local pre-publication
> commit `2f97357`, whose logic is what PR #127 merged. The published, re-measured evidence lives in
> the pin-advance directory.

### Original text (preserved unamended)

`ipd-correction-2f97357.patch` is the complete `git format-patch` of the IPD-owned correction
commit `2f97357` on branch `arena/63391e87-iips-production-market-data`, based on IPD
`main@b605a61`. It could not be pushed: the session's GitHub integration is read-only for
`ramkivs/iips-production-market-data` (`remote: Permission … denied`, HTTP 403; the REST refs API
returns `Resource not accessible by integration`). Both available tokens behave identically.

Apply with `git am` in an IPD checkout once the connection can write to that repository. The patch
is evidence, not an implementation claimed as published: the owning repository is IPD and the
authoritative record belongs there.

**Resolution of the blocker:** the connection was not the obstacle that mattered — a later IPD
session branch with write access carried the same correction to merge as PR #127. The patch file is
retained because it is the artefact that proved the correction existed while publication was
blocked; it is superseded by the merged commit above and must not be re-applied.
