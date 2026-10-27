# Read-back remediation — Contents API truncation, corrected to the Git blobs API

## What happened

The first remote read-back of the merged publication (`52f295a2f0d1475e4040dd673002853c120dfe8a`, PR
#321) used the GitHub **Contents** endpoint (`GET /repos/{owner}/{repo}/contents/{path}?ref={commit}`) and
base64-decoded `content`. That endpoint **omits `content` for blobs larger than 1 MB** and returns an empty
body with `encoding: "none"`.

Result of that first attempt: **18 artefacts compared, 17 PASS, 1 FAIL** —

| Field | Value |
|---|---|
| Path | `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` |
| Bytes returned | `0` (expected `2,622,521`) |
| SHA-256 of returned body | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (the empty-string hash) |
| Verdict | **FAIL — not a publication defect** |

The empty-string hash is the tell: the file was published correctly (its blob exists in the tree at
`8d9616eb8c…`), but the API refused to inline it. **No artefact was re-uploaded, rewritten or re-hashed to
"fix" this**, and the manifest was not adjusted to match a truncated read — that would have converted a
tooling defect into a false publication claim.

## Correction (verifier v2)

`verify_publication.py` now:

1. resolves every path to its **blob sha and exact size** from `git/trees/{commit}?recursive=1`;
2. fetches the bytes with **`git/blobs/{sha}`** (valid to 100 MB), refusing anything not returned as
   `base64`;
3. compares the decoded bytes' SHA-256 with the manifest **as published in the same commit**
   (`SHA256SUMS.txt` read back from that tree), so the check is self-contained and does not depend on the
   working tree being at that commit;
4. reports `local_match` separately, and treats only *remote-vs-published-manifest* as the pass/fail
   criterion.

## Re-run at `52f295a2` (same commit, no republication)

**18/18 artefacts MATCH byte-for-byte**, plus the two tree assertions → **20/20 PASS, VERIFIED**. The
tracker read back at its true `2,622,521` bytes with SHA-256 `964076956b05027f…`, identical to the manifest
and to the local file. The receipt is `03-publication-readback.json`.

## Lesson carried in the bundle

`local_match=False` on `verify_publication.py` is expected and correct in that receipt: the receipt was
produced by verifier **v2**, while the commit it verifies published verifier **v1**. Comparing a tool to its
own successor is not a publication mismatch, and the verifier says so explicitly rather than silently
passing. The refreshed manifest in this bundle records v2.
