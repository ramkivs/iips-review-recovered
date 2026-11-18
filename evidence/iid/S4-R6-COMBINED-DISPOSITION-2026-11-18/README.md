# S4-R6 combined disposition — supported partial publication

See `docs/integration/IID-S4-R6-COMBINED-DISPOSITION-2026-11-18.md` for original-source locators, access limitations, dispositions, exact blockers and unchanged OPEN statuses.

- `verify-assessment.ts`: bounded actual `assessCompany` execution on existing two-issuer repository inputs at the requested 2026-11-18 clock. No writer, host installation, metric admission, census, capability probe or historical test rerun. Blank-value contract representation is local/in-memory only.
- `assessment-verification.json`: projected verification receipt, not the full computed assessment/valuation payload or dataset. Infosys is FY24-basis, KEC FY26-basis; neither EV_REVENUE method is applicable. Zero invariant violations each. No numeric candidate admitted.
- `preservation.json`: baseline identities of 162 existing product/targeted-test, original investigation, closure and selected source-input/evidence files. Their bytes remain unchanged.
- `validation.txt`: new scoped checks and execution result only.
- `SHA256SUMS`: integrity of this metadata publication and main report.

Run from repository root:

```sh
iips-platform/node_modules/.bin/tsx evidence/iid/S4-R6-COMBINED-DISPOSITION-2026-11-18/verify-assessment.ts
sha256sum -c evidence/iid/S4-R6-COMBINED-DISPOSITION-2026-11-18/SHA256SUMS
```

`npm ci --ignore-scripts --no-audit --no-fund` installed the existing lockfile's dev dependencies locally; no dependency files changed.

Rights boundary: original PDFs, filing/page text, datasets, canonical numeric rows and full computed payloads are not included. No original issuer byte hash is invented: the source reader returned partial parsed content, not original bytes. Infosys full-filing NOT_DISCLOSED verification remains incomplete; KEC's supplied FY26 label is contradicted by original FY25 sources. A structural parser pass is neither claimed nor used to override that contradiction. Both S4-R6 and G-4 remain OPEN; no owner criterion/acceptance decision inferred.
