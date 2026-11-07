# WI-10 — `L-037`: the deep-page retrieval limitation, made checkable and left where it stops

**Register entry.** `L-037`, `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` §17.12 (origin),
§17.13 (generalised), §17.14 (WI-6A-S2 left it `OPEN` on purpose). The register is the authority for what this item says;
nothing here widens or narrows it.

> *Deep-page retrieval of large Indian issuer annual reports is capped by every available reader.* … **absence of wording
> beyond the retrieval cap is not evidence of absence.**

**Question this bundle answers.** §17.14 read both Zensar reports end to end, out of process, and left `L-037` `OPEN`
because "one issuer on one item is not that class". So what *is* the residue? Not that the bytes are unreachable — S2
reached them. Not that the pages are unreadable — S2 read them. This work item asked the question the entry actually
leaves open: **is there a reusable, reproducible retrieval capability in this repository, or only a series of one-off
harnesses each guarded by a test written for it?**

**Answer.** Only the second, until now. The fetch and extraction half of `L-037` is still outside the repository — this
environment has no egress to any issuer or exchange host and no PDF tooling, both measured again here
(`access/attempts.json`) — but the half the repository *can* own is now a contract rather than prose:

* `iips-platform/src/investment/sources/retrievalEvidence.ts` — a closed-vocabulary contract for a retrieval record
  (`RETRIEVED | REFUSED_BY_HOST | NO_ROUTE | TRUNCATED | MALFORMED | NOT_ATTEMPTED`), for a page extract and for a
  quotation (`READ_IN_THIS_RUN | READ_PREVIOUSLY | REPORTED_NOT_READ`), and a verifier that cross-checks them.
* `iips-platform/src/investment/sources/retrievalBundle.ts` — reads the record format WI-6A-S2 established
  (`source-bytes.json`, `page-map.json`, `quotes-verified.json`, provenance-headed extracts) without changing it.
* `iips-platform/src/investment/cli/verify-retrieval-evidence.ts` — the gate: exit 0 verified, 1 refused with named
  violations, 2 unusable bundle. No network, no PDF tooling, no writes.
* `iips-platform/tests/investment/retrieval-evidence.test.ts` — 27 targeted tests, including eleven negative controls and
  five that hold this bundle and the register to what they say.

The one rule `L-037` states is now mechanical: **a quotation marked READ may not stand on a document that was not
`RETRIEVED`, nor on a page the bundle did not extract, nor on an extract whose own header disagrees with the record.**

## What the gate does, in the order it does it

| Check | Refusal |
| --- | --- |
| Document status is in the closed vocabulary | `DOCUMENT_STATUS_INVALID` |
| A `RETRIEVED` document carries bytes, sha256 and a page count | `DOCUMENT_BYTES_MISSING`, `DOCUMENT_DIGEST_MISSING`, `DOCUMENT_PAGE_COUNT_MISSING` |
| A `COMPLETE` claim lists every page | `COMPLETE_READ_UNSUPPORTED` |
| A page lies inside its document, once, with a printed locator | `PAGE_OUTSIDE_DOCUMENT`, `PAGE_DUPLICATED`, `PRINTED_PAGES_MISSING` |
| One printed page identifies one sheet | `CALIBRATION_DUPLICATE` |
| The extract's header names the same document, page, page count, printed pages, bytes and digest | `HEADER_MALFORMED`, `HEADER_DOCUMENT_MISMATCH`, `HEADER_PAGE_INDEX_MISMATCH`, `HEADER_PAGE_COUNT_MISMATCH`, `HEADER_PRINTED_PAGES_MISMATCH`, `HEADER_SOURCE_DIGEST_MISMATCH`, `HEADER_SOURCE_BYTES_MISMATCH` |
| The document's extract list matches the page map | `DOCUMENT_PAGE_WITHOUT_RECORD` |
| A READ quotation stands on a `RETRIEVED` document | `QUOTE_FROM_UNRETRIEVED_DOCUMENT` |
| … and on a page that exists in the page map | `QUOTE_PAGE_NOT_EXTRACTED` |
| … and its recorded wording hashes to its recorded digest | `QUOTE_DIGEST_MISMATCH` |
| … and that wording is literally on that page | `QUOTE_ABSENT_FROM_PAGE` |
| A failed retrieval is never counted as read | `summary.quotationsRead` excludes `REPORTED_NOT_READ`; a bundle of failures reports `retrieved 0` |

## The real corpus verifies

`runs/01-s2-verification.txt` — the WI-6A-S2 bundle, unchanged, through the gate: **2 documents retrieved, 11 page
extracts of 347 pages, 2 quotations, 2 read, 0 violations.** The S2 evidence is not restated here; it is re-checked from
its own committed artifacts, and its bundle-local guard still passes (`runs/04-existing-guards.txt`).

## The control is refused

`control/fabricated-claim/` is a deliberate forgery of that record — a complete-read claim over 6 extracted pages, a
`REFUSED_BY_HOST` document still carrying extracts and a READ quotation, and a quotation moved to a page nobody
extracted. `runs/02-control-verdict.txt` shows exit **1** and eight named violations, among them
`COMPLETE_READ_UNSUPPORTED`, `QUOTE_PAGE_NOT_EXTRACTED` and `QUOTE_FROM_UNRETRIEVED_DOCUMENT`. The extracts in the
control are byte-identical to the real ones: what the gate must catch is the record diverging from the pages.

## Determination

**`L-037` is `PARTIALLY RESOLVED`.** The repository-owned half — the ability to say, offline and reproducibly, whether a
deep-page claim about *any* bundle is supported — is implemented and tested. The half that needs a network and a PDF
extractor is not in the repository, and by the standing constraint no new persistence harness was added:

* `R-037-01` in-process reader cap → **external**, open.
* `R-037-02` issuer/exchange/TLS reachability from this environment → **provider access**, open, measured in `access/attempts.json`.
* `R-037-03` no PDF tooling here → **external**, open.
* `R-037-04` no reusable verification of retrieval evidence → **implementation defect, resolved**.
* `R-037-05` bespoke temporary harness, no reviewable retrieval method → **reproducibility, partially resolved**.
* `R-037-06` printed-vs-PDF page numbering, renumbering, duplicate calibration → **page provenance, resolved**.
* `R-037-07` two-up column relationships not reconstructed → **parsing page, open** (the standing rule that a two-up
  sheet is never quoted as a single row still governs).
* `R-037-08` retrieval failure vs genuine absence → **implementation defect, resolved mechanically**.

Because `R-037-01`…`R-037-03` and `R-037-07` are outside this repository's control, the entry is **not** marked
`RESOLVED`, and the register says so in §17.21 with its own wording.

## Boundaries, stated so they cannot be misread

* No retrieval was performed in this work item. Every host probed failed before HTTP existed (TLS `SSL_ERROR_SYSCALL`,
  curl exit 35; an allowlisted control host answered 200 in the same shell). A failed fetch is recorded as
  `NO_ROUTE` — never as an empty document, never as an absence.
* `access/attempts.json` records what *this environment* could not reach. It says nothing about any issuer, any filing or
  any disclosure, and the file says so itself under `notClaimed`.
* No new persistence mechanism, table, journal or cache; no D-2 semantics, IX policy, valuation or mapping change; no IPD
  or IPO Screening change. The verifier is a pure function plus a reader and a CLI.
* `R-037-05`'s next step — a committed retrieval harness with pinned tooling, running where egress exists — is
  deliberately **not** done here: this work item was scoped to the repository-owned correction, and the harness belongs
  where it can actually fetch.

## Files

| Path | What it is |
| --- | --- |
| `determination.json` | status, the nine item-level findings with class, evidence, IID impact and next path, the boundary and the not-claimed list |
| `access/attempts.json` | six probes with exact curl exit codes and HTTP results, the tooling inventory, and the reading that a failed fetch is not an absence |
| `control/fabricated-claim/` | the forged record the gate must refuse |
| `runs/01-s2-verification.txt` / `.json` | the gate against the real S2 corpus |
| `runs/02-control-verdict.txt` | the gate against the forgery, exit 1, eight violations |
| `runs/03-targeted-tests.txt` | the 27 targeted tests |
| `runs/04-existing-guards.txt` | the S2 bundle guard and the L-035 nil-binding contract, 36 tests |
| `runs/05-typecheck.txt` | `tsc --noEmit` |
| `runs/06-clean-clone.txt` | the same tests and the same gate in a fresh clone of the pushed commit |
| `runs/07-manifest-verification.txt` | `digests.json` re-hashed file by file |
| `digests.json` | sha256 of every fixed file in this bundle; it excludes itself and the three run logs a later run rewrites (`03`, `06`, `07`), and says so in its `note` |
