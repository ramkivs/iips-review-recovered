# L-039 — KEC March 2026 current-investments delta evidence

**OPEN / UNRESOLVED_PENDING_EXTERNAL_EVIDENCE.** `CURRENT_INVESTMENTS` stays
`MISSING / NOT_REPORTED / value:null`. No admitted financial source, owner adjudication,
production code/data change, successor dataset or persisted report.

Full append-only record: `docs/integration/IID-L039-KEC-CURRENT-INVESTMENTS-DELTA-2026-11-17.md`.
Register §17.31; tracker §16.300 / CV-CORR-265 / CHG-2026-11-06-28 / V2211–V2216.
Baseline `ed839d116d1d7363431e7d771e2f90dcbb9b330c`; active branch
`arena/3c6fd35e-iips-review-recovered`. Session date Nov17; runner timestamps Nov18 retained,
not backdated or used for exhaustive as-of completeness.

## Inventory

- `baseline-and-provenance.json`: governing records, cutoff, source/transport run lineage.
- `pr563-reconciliation-readback.json`, `pr568-reconciliation-readback.json`: Nov16 publication reconciliation;
  public GitHub record does not resolve issuer economic zero or grant financial-source rights.
- `source/retrieval-ledger.json`: first finite official-source probe, exact URL, owner, date, status, raw/compressed
  body hashes and download/extraction limits. `.gz` files are lossless bodies, including labelled error responses;
  taxonomy `.gz` bodies decompress to original ZIPs, not extracted or modified replacements.
- `source/followup*/` and any `source/access-retry/`: separately retained follow-up/retry ledgers and bodies;
  zero-byte HTTP0 hashes are **empty responses**, not PDF/package hashes. Failed parsing/access is not absence.
- `candidate-dispositions.json`: compact per-candidate period/scope/locator/date/audit/admission/rights outcomes.
- `taxonomy-readback.json`: reproducible local XML inspection of official downloaded packages, member hashes,
  concept/labels/references/networks/imports/default arcs. **Not full DTS validation.** NSE IndAS package is2025;
  BSE's labelled-IndAS download contains2026 core but **AS / OtherThanBank** entry. No silent basis/date substitution.
- `precision-standard-extract.txt`: normalized excerpt from retained official XBRL2.1 body. Explicit decimals=-7
  is finite ₹1crore accuracy; the precision→inferred-decimals zero-INF rule does not override explicit decimals.
- `determination.json`: A/B/C closure paths all NOT_SATISFIED; lexical zero/rounded nonzero/default not adjudicated.
- `missing-value-verification.json`: canonical memory-only replay of existing WI8 and KEC refresh candidate.
  No writeDataset/persistence. Old WI8 identity source loading failure is exposed; historical payload carrier
  reused for financial-only assessment, **no new current identity qualification**.
- `preservation.json`, `validation.txt`, `digests.json`: append-only/unchanged-history and offline/regression checks.
  Manifest covers all bundle files except itself, not a self-referential hash or proof of financial admission.

Reproduction from repository root (isolated TypeScript tooling as recorded in validation.txt):

```sh
python scripts/l039_taxonomy_readback.py
python -m unittest discover -s scripts -p test_l039_delta_evidence.py
python -m unittest discover -s evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/probe -p 'test*.py'
cd iips-platform
# memory only; optional output replaces only the explicit diagnostic report path
npx tsx scripts/l039-delta-verify.ts ../evidence/real-issuer/L039-DELTA-2026-11-17/missing-value-verification.json
npx tsx --test tests/investment/l039DeltaMissingPreservation.test.ts
```

Do not rerun network capture merely to reverify retained evidence. Probe scripts require internet-capable
runner and isolated pypdf6.1.3; no product/IPD installation. Initial annotation transport caps and subsequent
artifact-only recovery are recorded; temporary workflows removed from final tree. No full PDFs, unrelated
large archive, runtime dataset or generated production artifacts are added.

**Rights/admission:** every newly retrieved candidate is discovery only. Official/public availability does not
establish licence, redistribution rights, provider admission, O3, owner acceptance or execution authorization.
Neither disputed zero nor a fabricated nil is mapped. Existing cash/debt, same-instant and L-040 rules remain.
External closure requires a qualifying audited/filed same-instant consolidated amount/nil, or applicable taxonomy
and sufficient authoritative issuer/exchange confirmation validating economic zero; rights and any needed owner
policy decision remain explicit prerequisites. L-038 is not reopened; no other limitation investigated.

Text extraction normalization: only trailing line/EOF whitespace trimmed in generated `.txt` extracts; raw downloaded bodies are lossless and their source hashes unchanged.
