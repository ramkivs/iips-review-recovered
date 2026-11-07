# Negative control — a fabricated deep-page claim, and the gate that refuses it

Nothing in this directory is a retrieval. It is a **deliberate forgery** of the WI-6A-S2 record with three defects that a
deep-page claim is most likely to carry in practice:

| # | Forgery | What it would buy if unopposed |
| --- | --- | --- |
| 1 | `source-bytes.json` documents[0] declares `completeness: "COMPLETE"` while only 6 of its 167 pages have extracts | a claim to have read the whole report |
| 2 | `source-bytes.json` documents[1] records `httpStatus: 403` with no bytes and no digest, yet its extracts remain and one quotation still says `READ_IN_THIS_RUN` | a read drawn out of a refused fetch |
| 3 | `quotes-verified.json` quotations[0] is moved to PDF page 92 / printed pp.33-34, which no extract covers | a quotation at a locator nobody read |

`tsx src/investment/cli/verify-retrieval-evidence.ts evidence/real-issuer/WI10-L037-DEEP-PAGE-RETRIEVAL-2026-11-07/control/fabricated-claim`
exits **1** and names each defect (see `../../runs/02-control-verdict.txt`). The extracts are byte-identical copies of the
real S2 pages *on purpose*: the gate has to catch the record diverging from the pages, not the pages being wrong.
