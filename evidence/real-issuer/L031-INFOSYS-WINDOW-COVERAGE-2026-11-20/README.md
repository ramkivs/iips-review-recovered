# L-031 Infosys Window Coverage — Operator-Declared Table (2024-03-31 → 2026-11-20)

*IID Stage 4 — `L-031` window coverage, residual of `S4-R8`/`G-8` (Data Supply +
Proof). Append-only bundle; no historical evidence bundle is modified. This bundle
records the operator-declared Infosys corporate-action table for the exact window
`L-031` left unverified, transcribes its one canonically representable event, and
verifies the resulting candidate. It does not install, operate, or accept anything.*

## 0. Boundaries

- **No canonical schema extension** (no `DIVIDEND` type was invented), no
  validator/tolerance/policy/freshness/valuation change.
- Candidate verification is **not** installation, live verification, or
  acceptance; the candidate was built under `/tmp` outside the repository and
  is **not installed** on any host.
- No IPD repository file was created, edited, moved, or deleted; no pull
  request was merged.

## 1. What was supplied and what it establishes

The operator-declared window table is preserved **verbatim** at
`source/operator-declared-window-table-2026-11-20.json`. It contains:

- **An explicit nil declaration:** between 2024-03-31 and 2026-11-20 Infosys
  executed **no** bonus issues, stock splits, rights issues, mergers, or
  demergers altering per-share nominal value or multiplying share counts; face
  value remained ₹5 throughout. This is precisely the instrument register §16.2
  names ("an operator-declared table covering the window").
- **Six cash dividends** (₹28.00 FY24 final+special through ₹26.00 FY27
  interim), fully documented with dates and locators.
- **One tender-offer buyback:** 100,000,000 shares at ₹1,800 (₹18,000 Cr),
  record date 2025-11-14, extinguished 2025-12-04. Its share-count bridge
  reconciles exactly: 4,154,401,349 − 100,000,000 + 223,060 RSU =
  **4,054,624,409**.
- **A capital-base note:** in-window share-capital change only via routine
  ESOP/RSU allotments and the buyback extinguishment.

**Honesty boundary:** the table is operator-attested; the referenced PDFs were
not retrieved in this session and independent verification is **NOT_CLAIMED**
(locators preserved). All arithmetic the table supports was hand-checked and
passes (`runs/03-derived-handchecks.json`).

## 2. Governed transcription

`probe/build_window_coverage.py` (re-running reproduces the input byte-for-byte)
copies the S4-R8 successor input byte-for-byte — including the admitted 2018
BONUS record, preserved exactly — and appends **one** record:
`CA-INFY-BUYBACK-TENDER-2025-12-04` (`BUYBACK_TENDER`, effective on
extinguishment, `perShareComparable: true`, factor **1** — a tender buyback
makes no per-share restatement, mirroring the canonical buyback fixture).
The dividends are **documented, not transcribed**: `DIVIDEND` is not a canonical
type (the 2026-11-17 class-5 determination stands) and cash dividends break no
per-share comparability. ESOP/RSU allotments likewise documented only. The nil
declaration is preserved as evidence, not encoded as a record.

Successor input digest:
`sha256:c8dd466608e93ceca26d924516d06ffa805c259f2b78eefbf402980029cc3b7f`.

## 3. Candidate and behaviour

- **Before/after:** candidate `sha256:a7638c6b…` (corporateActions 1) →
  **`sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd`**
  (**corporateActions 2**, 0 issues), read back byte-faithful
  (`runs/01`, `runs/02`).
- **Behaviour:** the buyback neither blocks an unadjusted demonstration price
  (per-share-comparable) nor restates per-share points (factor 1); the 2018
  bonus continues to restate pre-action points by 0.5. Pinned in
  `iips-platform/tests/investment/l031InfosysWindowCoverage.test.ts` (7 tests).

## 4. Status disposition

- **`L-031`: RESOLVED (2026-11-20, register §17.44).** Both limbs of §16.2's
  required resolution are now demonstrated with real evidence: the
  window-coverage table (this bundle) and the real-action guard/factor
  acceptance (register §17.43). Infosys's "unadjusted price" dataset claim is
  no longer an assumption for the declared window: share-multiplying events
  are declared absent, and the window's one capital event is declared and
  non-restating. Coverage is operator-declared (not independently verified)
  and extends to 2026-11-20 as stated, no further.
- **`S4-R8` / `G-8`: CLOSED (2026-11-20, §17.43)** — unchanged.
- O3 successor admission:
  `docs/integration/IID-O3-L031-INFOSYS-WINDOW-SUCCESSOR-ADMISSION-2026-11-20.md`.

## 5. Artifact digests

See `digests.json` (beside this README). Candidate bytes live outside the
repository and are exactly reproducible from the three committed inputs via
the authoritative CLI at the pinned clock.
