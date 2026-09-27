D8 / GATE-Y INTELLIGENCE M-1 -> M-5 GOVERNANCE ACT — DURABLE HANDOFF EXPOSURE
==============================================================================
Published (UTC):          2026-09-27
Published by:             Arena session agent (session branch arena/01a0e30f-iips-review-recovered)
Purpose:                  The Arena sandbox workspace is not downloadable by the maintainer.
                          These artifacts are therefore exposed byte-exactly here, in this
                          repository, so they can be retrieved on Windows and used to publish
                          the prepared governance act to the authoritative repository.

WHAT IS IN THIS DIRECTORY (the three handoff artifacts are BYTE-EXACT and UNMODIFIED;
this note is additive and is not part of any digest anchor):

1. GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md
   SHA-256: f4f67ca3f18a3573b4737fc77a160622689166f163d3862854fba79fd69504dc
   Bytes:   18089   Lines: 272
   The exact governance act prepared and locally committed as
   5492a244fa1db0f5a3675dad811b49dcbdb7af07 (parent
   3aa4dced270c5341a8be296ae22fb0df2545ad64) in
   ramkivs/iips-production-market-data. In-repo target path:
   evidence/intelligence-data-supply-governance/GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md

2. 0001-governance-GATE-Y-record-RAMKI-D8-Intelligence-desig.patch
   SHA-256: 73e270fae21ada4d966ed39b1cfd73e836da37522c6982cca14897c29acf5fe8
   git format-patch of 3aa4dced... -> 5492a244... : exactly ONE added file
   (the act above, new file mode 100644, 272 insertions; no source/test/config).
   Usable via `git am` (recreates message/authorship) or `git apply` / `git apply --index`.

3. HANDOFF-MANIFEST.txt
   SHA-256: 215e650a0ef7fc46dd3330890e00929dcaad447806d629032d4a3f929ce28491
   Full integrity manifest (repository, branch, parent/prepared SHAs, commit tree,
   act path/digest/size, patch digest, Windows preconditions, status at export).

RETRIEVAL ON WINDOWS (byte-exact; curl preserves LF endings):
   curl.exe -L -o GATE-Y-ACT.md "https://raw.githubusercontent.com/ramkivs/iips-review-recovered/arena/01a0e30f-iips-review-recovered/artifacts/gate-y-windows/GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md"
   curl.exe -L -o gate-y.patch  "https://raw.githubusercontent.com/ramkivs/iips-review-recovered/arena/01a0e30f-iips-review-recovered/artifacts/gate-y-windows/0001-governance-GATE-Y-record-RAMKI-D8-Intelligence-desig.patch"
   curl.exe -L -o HANDOFF-MANIFEST.txt "https://raw.githubusercontent.com/ramkivs/iips-review-recovered/arena/01a0e30f-iips-review-recovered/artifacts/gate-y-windows/HANDOFF-MANIFEST.txt"
   Verify: certutil -hashfile GATE-Y-ACT.md SHA256
   Expected: f4f67ca3f18a3573b4737fc77a160622689166f163d3862854fba79fd69504dc

WINDOWS PUBLICATION (to ramkivs/iips-production-market-data, branch
arena/01a0ddae-iips-production-market-data) — preconditions and sequence:
   1. Verify Windows checkout HEAD == 3aa4dced270c5341a8be296ae22fb0df2545ad64,
      LOCAL == REMOTE, worktree CLEAN. If the remote tip has moved: STOP
      (no rebase, no merge, no reset, no force-push).
   2. Apply artifact 1 (after SHA-256 verification) or artifact 2 via git am / git apply.
   3. Verify the resulting file's SHA-256 == f4f67ca3...04dc (certutil).
   4. Commit (normal fast-forward over 3aa4dce; no force), push to
      refs/heads/arena/01a0ddae-iips-production-market-data, verify LOCAL == REMOTE.
   Note: a fresh Windows commit will carry its own SHA (committer identity/time);
   the integrity anchor is the act file SHA-256, and the parent must remain 3aa4dce.

STATUS: as of this exposure the act is NOT durably published; the authoritative remote
(ramkivs/iips-production-market-data, branch arena/01a0ddae-...) remains at the antecedent
3aa4dced270c5341a8be296ae22fb0df2545ad64, and main remains at
4d3e1cdca3a33da0ec3be8b336b17128108a502c. The Intelligence data-supply governance path is
NOT open until the publication push is verified on that remote. Nothing in
ramkivs/iips-production-market-data was modified by this exposure; this commit adds files
ONLY to the session branch of ramkivs/iips-review-recovered.
