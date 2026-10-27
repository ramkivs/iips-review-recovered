# Verbatim transcription of the operator-supplied host-evidence summary (2026-10-27)

**Character of this file.** This is a **verbatim transcription of prose supplied by the operator in the
2026-10-27 instruction**. It is **not** a raw host transcript, **not** a PowerShell output capture, and
**not** a byte-for-byte copy of any file under `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`. Arena has no route
to that Windows directory. No digest in this bundle is computed from operator-local evidence bytes, because
Arena has none of those bytes. The text below is preserved so that the inputs to this reconciliation are
auditable; it is **not** offered as acceptance evidence.

The two operator-captured evidence sets referred to below — (i) the fresh preflight capture run and
(ii) the separate read-only host assessment — are the two original evidence captures that must be supplied
**verbatim** to the governed bundle. Their raw bytes, filenames beyond those stated, and per-file SHA-256
digests are **NOT AVAILABLE TO ARENA** and are recorded as `null` in `03-evidence-manifest.json`.

---

## A. New operator-captured host evidence (verbatim)

> **New operator-captured host evidence**
>
> - Host: `DESKTOP-NO0NHTP`
> - Account: `DESKTOP-NO0NHTP\USER`; SID `S-1-5-21-1872737340-673410177-2240931581-1001`
> - Non-elevated; `AuthenticatedUsersGroupPresent=True`
> - `C:\iips-data` and `C:\iips-data\iips` currently exist as ordinary directories; neither is a reparse point.
> - Both directories report creation on 2026-10-26. Their provenance has not been established; do not infer who created them or which action created them.
> - C: is reported as local, fixed, healthy NTFS in the preflight transcript.
> - `C:\iips-data\iips` is outside `C:\Users\USER\OneDrive`.
> - The ACL for `C:\iips-data\iips` grants `Authenticated Users` `Modify, Synchronize`; the current identity is a member of `Authenticated Users`.
> - The F4 store and `-wal`, `-shm`, and `-journal` artifacts are all absent.
> - Fresh capture run `cap03-p1-20261027-02` is under `C:\IIPS-EVIDENCE\cap03-p1-20261027-02`. Its instrument SHA-256 is `B5D58F7FFF78C34DFFCD189EAC46A27889775F44ABF60F1A8ABD905224093C95`.
> - That capture completed without a `STOP.txt`; the transcript error scan returned zero matches. The corrected ancestor traversal was independently reproduced and reached `C:\` without errors.
> - A separate read-only host assessment subsequently confirmed the current directory attributes, ACLs, identity, OneDrive comparison, and store/sidecar absence.

## B. Governing constraints supplied with that evidence (verbatim, condensed to their operative clauses)

> - Apply the existing effective DISP-01/PF-13 interpretation. Do not reopen or replace the F4 designation.
> - Reconcile the new host measurements with the previous record's statement that the terminal parent was absent. Record the prior assertion's provenance accurately: it was based on earlier operator-reported state, whereas the new state is host-captured. Preserve the fact that the directories' creation provenance is unknown. Do not allege unauthorized creation and do not claim a causal explanation.
> - PF-13 at P-1-session scope evaluates the nearest existing ancestor for local fixed NTFS and non-synchronized/non-network location; the terminal parent does not have to pre-exist. Do not incorrectly create a new authority blocker solely because the parent exists.
> - Do not treat the absence of `STOP.txt` or zero matches in a limited error scan as proof that every acceptance condition passes.
> - If Arena cannot access the operator's local evidence directory, explicitly identify the evidence files that must be supplied; do not pretend to have read or deposited them.

---

**Terminology guard.** `Synchronize` in the reported ACL is a standard Windows file-access right; it is
**not** an indicator of cloud synchronization. `AuthenticatedUsersGroupPresent=True` is a group-membership
observation, not a volume or synchronization measurement. `IsReparsePoint=False` is an attribute of the
two directories, not a claim about the whole volume. These distinctions are applied in
`02-pf-criterion-assessment.json`.
