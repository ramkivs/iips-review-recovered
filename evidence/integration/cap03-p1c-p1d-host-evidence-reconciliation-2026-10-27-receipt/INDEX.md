# Evidence — publication receipt for `IIPS-V3-CAP03-P1C-P1D-HOST-EVIDENCE-RECONCILIATION-2026-10-27-01`

Companion receipt for tracker **§16.151.8** (`CV-CORR-131`, `CHG-2026-10-27-08`, `V1025`). The primary
reconciliation and its bundle were published by IRR PR **#325**; this receipt records the verified
publication chain and the **independent remote blob/byte read-back** at the merge commit. It changes no
substantive status, no value, no pin, no fence, no store artifact and performs no host contact.

| Field | Verified value |
|---|---|
| Repository / ref | `ramkivs/iips-review-recovered`, `refs/heads/main` |
| Carrying PR / result | **#325**, `MERGED` (regular 2-parent `--merge`) |
| Tested PR head | `7c78f40e77b19b7ba83827e79cce34b8cbef2256` |
| Merge commit / tree | `acb97c9e1335dd3fc4c1c7c6f04c5be83a16a26d` / `50e4ab453343374feecdc5229acffaa793804d1c` |
| Merge parents / date | `064e9f1fd038c2e81db90058e30dfa2a637331d3` + tested head; `2026-10-27T06:09:43Z` |
| Exact-head CI | run `40459212419` — `completed / success` (`pull_request`, tested head) |
| Post-merge `main` CI | run `40459451075` — `completed / success` (`push`, merge commit) |
| Independent read-back | GitHub Git Trees API at the merge root tree for path→blob identity, then GitHub Git Blobs API per blob (base64 decode); decoded bytes compared byte-for-byte with the tested-head files; SHA-256 and `git hash-object --stdin` recomputed |
| Read-back result | **29/29 artifacts MATCH, byte-identical**; `all_content_checks_pass = true` |

| File | Purpose |
|---|---|
| `00-publication-readback.json` | Full machine record: method, coordinates, CI run IDs/conclusions, per-artifact blob SHA, remote/local byte sizes and SHA-256, recomputed Git object identity, decoded-tracker content checks |
| `verify_publication.py` | Re-checks the receipt JSON, the receipt bundle digests, the **unchanged** primary bundle `SHA256SUMS.txt`, tracker §16.151.8 and the singleton §16.151 heading |
| `SHA256SUMS.txt` | Digests of the receipt bundle (excluding itself) |

Artifacts covered by the 29/29 read-back: the tracker; the focused record; all **19** files of the primary
evidence bundle (including the 11 verbatim copies of the earlier capture); and seven unchanged primary-source
blobs (reconciliation `-01`, PF-15 act `-02`, published instrument, and four earlier-capture transcripts).
The operator-local `C:\IIPS-EVIDENCE\cap03-p1-20261027-02` evidence is **not** among them: its raw bytes
remain **NOT SUPPLIED**, with `null` digests and an explicit required-file list in the primary bundle's
`03-evidence-manifest.json`.

**Current result.** §16.151 is EFFECTIVE as a recorded reconciliation. `P-1-C` `NOT ESTABLISHED`;
`P-1-D` `DESIGNATED; SUBSTANTIVELY SUPPORTED AT REPORTED CAPTURE; NOT VERIFIED FOR THE ATTEMPT`;
`P-1` `UNSPENT / UNEXECUTED / NOT AUTHORIZED`; F4 unchanged; no gate advanced. This receipt does not
self-embed its own carrying coordinates; those are established by remote read-back of its own merge.

## Reproduction

```bash
cd evidence/integration/cap03-p1c-p1d-host-evidence-reconciliation-2026-10-27-receipt
python3 verify_publication.py     # expects: PUBLICATION RECEIPT VERIFIED, exit 0
shasum -a 256 -c SHA256SUMS.txt
```
