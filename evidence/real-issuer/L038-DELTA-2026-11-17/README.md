# L-038 delta evidence — OPEN, no financial observation admitted

Record: `docs/integration/IID-L038-MARICO-PREFERENCE-CAPITAL-DELTA-2026-11-17.md`.
Governing limitation-register §§17.23–17.24, W07 cutoff **2026-11-12**, tracker §16.282 preserved;
new append-only register §17.30 / tracker §16.299. IRR only. **L-039 not begun.**

## Contents and meaning

- `baseline-and-provenance.json`: baseline commit/Git blob ids, branch, source/recovery run ids and rights boundary.
- `source/retrieval.json`: successful bounded runner ledger, exact public URLs/HTTP responses, PDF metadata,
  source-byte SHA-256/page counts and all retained extract hashes. `retrieval-initial.json` preserves initial
  access/tool failures; these never establish non-existence.
- `source/*.pageN.txt`: **52 bounded extracts** — six targeted form pages from each prior FY24/FY25 MGT-7 draft,
  plus the first **40 of 127 capital-keyword hit pages** in a newly inspected **703-page** FY26 subsidiary compilation.
  The filename is the PDF page locator; plain text is a derivative, not a replacement for original source bytes.
  No raw PDF is committed. Not every component's audit/signature/finality is authenticated and not all 703 pages
  were substantively reviewed. A keyword index is not complete subsidiary/group scope reconciliation.
- `candidate-assessment.json`: per-candidate identity, scope, dates/unknown filing dates, exact locators,
  classes/amounts, final/draft status, completeness, rights/admission and closure-path assessment.
- `discovery-log.json`: targeted query/directory findings and limits, including partial browser inspection of
  a prior-to-cutoff AGM-transcript cover. No primary-byte digest is invented for that browser-only item.
- `missing-value-verification.json`: existing Marico inputs replayed **in memory** through production paths,
  retaining every missing preference claim and safely withheld bridge. Production-computed repeated content
  digests are not a new dataset or fabricated before/after data-change demonstration.
- `safeguards.json`: baseline evidence/input/production file equality and append-only historical register/tracker proof.
- `validation.txt`: exact local commands/results; TypeScript execution distinguished from GitHub static CI.
- `digests.json`: machine-generated integrity manifest, excluding itself.

## Determination and boundaries

**A/B/C are NOT SATISFIED. L-038 OPEN / UNRESOLVED_PENDING_EXTERNAL_EVIDENCE.**
The subsidiary compilation is **new to documented inspection**, not proven newly published since W07. July PDF
metadata and retrieval timestamps do not authenticate publication/filing dates. FY26 parent annual-report bytes
match the prior WI12 copy; no repeat 793-page review. Tested final/FY26 MGT-7 URLs return 404, not proof that no
signed filing exists elsewhere or in authenticated MCA services. No final parent receipt was obtained. Draft parent
zeros, authorised capital, ordinary-share text and isolated subsidiary amounts never become a consolidated nil.
Path C still needs complete authoritative evidence **and an explicit governed owner scope acceptance**, not made here.

All fresh external sources are **DISCOVERY_ONLY_NOT_ADMITTED**. Public accessibility is not an independent rights
grant or source admission. No O3/provider/rights expansion; no acceptedBy invented; no production source, data,
financial rule, period-alignment or L-040 change. No dataset directory/payload/host installation or IPD operation.

## Reproduction

From `iips-platform/`:

```text
npx tsx scripts/l038-delta-verify.ts ../evidence/real-issuer/L038-DELTA-2026-11-17/missing-value-verification.json
npx tsx --test tests/investment/l038DeltaMissingPreservation.test.ts
```

The fresh-source probe is `scripts/l038_delta_source_probe.py`, using Python and isolated pypdf **6.1.3**.
It requires an internet-capable research environment; do not interpret tool/TLS/HTTP errors as absence. The temporary
GitHub capture workflow was removed before PR; retrieval and transport run ids remain in provenance. Do not re-fetch
just to reproduce the in-memory verification or re-run the earlier annual-report investigation unnecessarily.
