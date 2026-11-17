# W05 D1/D2 decision implementation evidence

This evidence folder contains governance text and metadata-only source-package inventory. It does **not** contain a filing, extracted page text, figure, financial conclusion, dataset, or source document.

- The operative D1/D2 addendum is [`docs/integration/W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17.md`](../../../docs/integration/W05-D1-D2-DECISION-IMPLEMENTATION-REGISTER-2026-11-17.md).
- The tracker receipt is §16.292 in the canonical master tracker.
- [`publication-surface-audit.json`](publication-surface-audit.json) records GitHub visibility, release/artifact/Pages/fork/package checks, anonymous HTTP outcomes, and the per-asset authenticated content audit from hosted run `44139023529`. The release ZIP has 1,140 inventory-matched members and zero PDF/Office-like path or leading-PDF-signature hits; exact AGI/ISIN strings occur in JS/TS/test paths enumerated there. One raw-content host request could not be tested because TLS failed in this sandbox; no status is claimed for it.
- [`agi-source-package-inventory.tsv`](agi-source-package-inventory.tsv) records the five AGI PDF identities, reporting periods, page counts, byte lengths, SHA-256 values, the official IR locator, and the Principal-reported local file mtimes and method. The C: filesystem is not accessible from the Arena sandbox; the supplied local metadata is attributed to the Principal rather than represented as independently stat-verified. ZIP-member and commit timestamps remain separately identified as packaging/commit metadata.
- The completed financial analysis is a local-only working paper at `local-work/AGI-Greenpac-financial-assessment-2026-11-17.md`. It is deliberately **not tracked or published**. The remote record cites its local path only.

## Boundaries preserved

No issuer is admitted; O3 remains limited to Infosys, Marico and KEC. No redistribution right or dataset installation is authorized. `L-041`, `L-042`, Q1–Q7 and W05 statuses are unchanged. Changing repository visibility to private prevents current anonymous GitHub access but does not recall prior copies or caches.

## Validation

Run `python evidence/integration/w05-d1-d2-decision-implementation-2026-11-17/validate.py` from the repository root. The script checks the dedicated source-branch ZIP digest and every PDF entry hash against the metadata inventory, and checks decision/tracker identifiers and preserved statuses. It performs no network retrieval.
