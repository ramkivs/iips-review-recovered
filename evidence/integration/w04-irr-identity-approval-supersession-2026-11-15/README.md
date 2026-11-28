# W04 — superseding identity approval `W04-D1-20261115-01`: evidence

Record: [`docs/integration/IIPS-W04-IRR-IDENTITY-APPROVAL-SUPERSESSION-2026-11-15.md`](../../../docs/integration/IIPS-W04-IRR-IDENTITY-APPROVAL-SUPERSESSION-2026-11-15.md).

Everything here was produced in the sandbox on 2026-11-15, on Linux, with Node v22.22.3. Nothing was run on the Windows host. **No run installed anything.**

- The IPD tool ran from a checkout of `ramkivs/iips-production-market-data` at `main` `901e4791e271cafdb777d56f9f66f6867b3f60c6`, with no tracked file changed. Nothing was written to IPD.
- IRR code was run unmodified at `08411bcd6d782a601fe5c82cc9983d076831148d`.
- Every run of the tool was made in a network namespace without interfaces (`unshare -rn`).

**The approval record is not in this directory and not in this repository.** It is kept on the host, by the Principal's decision. Its SHA-256 as written is `70d49544845120755adff9b5f39bc0de216c6a983fa0dbbdcd613ab9b26b440d` (4,374 bytes).

| File | What it is |
|---|---|
| `principal-authorization.json` | The Principal's instruction, restated, and the four decisions given in the session: the review date, the IPD tool commit, the statement and the publication. It also says how the two values that were not asked were set. **It is not an approval record**; it has another schema, and the tool refuses it as one. The statement text is not reproduced; its SHA-256 is given. |
| `review-for-approval-901e479.json` | The review record the tool wrote for staging A. Schema `IPD_IRR_IDENTITY_REVIEW_V2`, `readyForApproval` true. SHA-256 `dcd705e7b27893b194044c53e75f66faef46b7e307d47a2328293af2775609b0`. The `subject`, `scope` and accepted lists of the approval record were carried over from it. **It is not an approval record.** |
| `01-review-run-published-manifest.txt` | `review --accept-withheld 2 --irr-root <IRR checkout> --as-of 2026-11-15` with the P7 manifest the checkout tracks: generation, IRR's own loader gate, and everything an approval record has to state. P7 digest `69a918f7…4769`. Ends `REVIEW RESULT: COMPLETE`. Exit code 0. Then the content of the staging directory (staging A). |
| `02-review-run-previous-manifest-control.txt` | Control. The same command with the previous manifest given by `--p7`. The same three identity files; P7 digest `13bd2ef1…078bc`. Exit code 0. Staging B. |
| `03-mechanism-demonstration-fictitious-authority.txt` | The old-manifest dependency shown with the governed rules and a fictitious authority. Four records in memory, built with IPD's test fixture under its test policy. A record that binds the previous digest is refused for staging A with `GENERATION_MISMATCH` only; a record that binds the published digest authorizes staging A; the reverse pair confirms it. |
| `mechanism-demonstration-fictitious-authority.mjs` | The script of file 03. It imports the built modules of an IPD checkout. It writes nothing. |
| `04-check-approval-W04-D1-20261115-01.txt` | The real record against the governed policy, on the command line. By itself: no failure. Against staging A: `RESULT: PASS`, exit code 0. Against staging B: `GENERATION_MISMATCH`, exit code 7. Then the same record as a Windows transfer could deliver it (CRLF, byte-order mark): accepted each time, with the SHA-256 the tool would print. |
| `05-independent-reverification-fresh-clones.txt` | The whole chain again from fresh clones of both repositories, fresh installs, a fresh build and a new staging directory (staging C). The review record is byte-identical with that of file 01. `check-approval` of the real record: `RESULT: PASS`, exit code 0. |

## What these runs do not show

- **An installation.** `install` was not run. There is no install receipt for this record.
- **Anything on Windows**, including the wrapper `Invoke-IrrIdentityProvisioning.ps1`.
- **That the host checkouts are at the two commits the record names.** If they are not, the tool refuses on the host.
- **A refusal on account of the review date.** The record lapses at `2026-11-16T18:29:59Z`. IPD's test `IAP-30` covers the rule.
- **The existing record `W04-D1-20261114-01`.** It is on the host and was not read. No copy or reconstruction of it was made, not even for a test.

## Reproduce

In an IPD checkout at `901e479` and an IRR checkout at `08411bc`:

```
# IPD
npm ci && npm run build:tsc
# IRR
cd frontend && npm ci
# IPD
node scripts/provision-irr-identity-sources.mjs review --staging <staging> --accept-withheld 2 --irr-root <IRR checkout> --as-of 2026-11-15
node scripts/provision-irr-identity-sources.mjs check-approval --approval <approval record> --staging <staging>
```

The second command needs the approval record file, which only the Principal holds. The tool commit a reproduction prints is the commit of the checkout it runs from. At any other commit the record is refused with `IPD_TOOL_COMMIT_MISMATCH`.

## Notes on the transcripts

- Paths are replaced by `<staging A>`, `<staging B>`, `<staging C>`, `<IRR checkout>`, `<IPD checkout>`, `<approval record>` and `<previous P7 manifest>`.
- The two ISINs in the transcripts are the two master records the export withholds (`ISSUER_SHARED_ACROSS_ISINS`). They appear as records of the security master, as IPD's records already publish them, and say nothing about any holding. No holding, portfolio or identity assignment was read.
- The three identity-file digests equal those of IPD's `review-run-3b92471.txt` and of its test `IIX-04`.
