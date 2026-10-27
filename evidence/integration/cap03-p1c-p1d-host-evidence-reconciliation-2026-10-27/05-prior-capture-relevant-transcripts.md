# Verbatim raw transcripts — earlier capture `cap03-p1-reconcile-20261026T201328Z`

**Provenance.** These are byte-identical copies of the nine relevant raw transcripts already published
at `evidence/integration-/cap03-p1-reconcile-20261026T201328Z/` on IRR `main`
`f74af6d4f488ebf6d3e3a94f612a0d831b6b765a`. The originals are **not edited**; all eleven files are
also copied byte-for-byte into `06-prior-capture-verbatim/` of this bundle. No raw transcript from
the new operator run `cap03-p1-20261027-02` exists in this repository (see `03-evidence-manifest.json`).
Arena performed no Windows command and no recapture.

## `00-run-parameters.txt` — 427 bytes — SHA-256 `1bc7f35cd49d6fb791149610adc4829c66dad5da84d4711b6b01f1b41c8d1cf8`

```text
RunId=cap03-p1-reconcile-20261026T201328Z
ObservedUtc=2026-10-26T20:13:28.3346687Z
StorePath(verbatim)=C:\iips-data\iips\user-portfolio.sqlite
EvidenceRoot=C:\iips-evidence\cap03-p1-reconcile-20261026T201328Z
IpdRoot=C:\iips-work\iips-production-market-data
IrrRoot=C:\iips-work\pf08-irr-clean-tree-20261026
NodePath=C:\Users\USER\AppData\Local\nodejs22\node-v22.22.0-win-x64\node.exe
ProvisioningInvoked=False
P1Executed=False
```

## `02-pf02-pf03-os-identity.txt` — 362 bytes — SHA-256 `a2809e02c91f34672926e1099567f73964156cde7976f773bf530b0bc229ed60`

```text
Name=02-pf02-pf03-os-identity
StartedUtc=2026-10-26T20:13:28.4692453Z
EndedUtc=2026-10-26T20:13:28.7407381Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
OSCaption=Microsoft Windows 11 Home Single Language
OSVersion=10.0.26300
OSBuild=26300
Account=DESKTOP-NO0NHTP\USER
AccountSID=S-1-5-21-1872737340-673410177-2240931581-1001
IsAdministrator=False
--- OUTPUT END ---

```

## `03-pf04-pf05-pf06-runtime.txt` — 597 bytes — SHA-256 `92b213a7f99e802e73c56922684b81c6fcf0872228e3ab8fb590ff67a3d3283e`

```text
Name=03-pf04-pf05-pf06-runtime
StartedUtc=2026-10-26T20:13:28.7499686Z
EndedUtc=2026-10-26T20:13:29.8064824Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
NodePath=C:\Users\USER\AppData\Local\nodejs22\node-v22.22.0-win-x64\node.exe
{"platform":"win32","node":"v22.22.0","arch":"x64","execPath":"C:\\Users\\USER\\AppData\\Local\\nodejs22\\node-v22.22.0-win-x64\\node.exe"}
SQLiteProbeBegin
{"v":"ok"}
(node:19440) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
SQLiteProbeEnd
--- OUTPUT END ---

```

## `04-pf07-pf08-pf09-repositories.txt` — 791 bytes — SHA-256 `ef83c7ac8a0b2a539968acb90f505e41c70ab2399aee020bfddcb00f6f4291c9`

```text
Name=04-pf07-pf08-pf09-repositories
StartedUtc=2026-10-26T20:13:29.8153465Z
EndedUtc=2026-10-26T20:13:31.8929380Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
[IPD] Path=C:\iips-work\iips-production-market-data
HEAD=8eec74ae27cda09f3c368b9c299895eae41554db
TREE=4eba29029f8d95cfe483e615a7047426b298ce50
PORCELAIN-BEGIN
PORCELAIN-END
UnstagedDiffExit=0
StagedDiffExit=0
ExpectedHEAD=8eec74ae27cda09f3c368b9c299895eae41554db
ExpectedTREE=4eba29029f8d95cfe483e615a7047426b298ce50
IsShallow=false
[IRR] Path=C:\iips-work\pf08-irr-clean-tree-20261026
HEAD=ba64b2d5927c2f872560710cf1474c25a5cde0d5
TREE=5e4262f1cd75bf13b76ced5b45058f31434b5dad
PORCELAIN-BEGIN
PORCELAIN-END
UnstagedDiffExit=0
StagedDiffExit=0
ExpectedIRRHeadFromHostFollowup=ba64b2d5927c2f872560710cf1474c25a5cde0d5
--- OUTPUT END ---

```

## `06-pf11-pf12-pf13-store-path.txt` — 1312 bytes — SHA-256 `51a7c2d4f8aace6e2eeb2b4ee59e88e592d126bee8739797b636c0d3c5211571`

```text
Name=06-pf11-pf12-pf13-store-path
StartedUtc=2026-10-26T20:13:31.9352412Z
EndedUtc=2026-10-26T20:13:32.4383001Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
StorePath(verbatim)=C:\iips-data\iips\user-portfolio.sqlite
StoreParent=C:\iips-data\iips
StoreParentExists=True
Exists[C:\iips-data\iips\user-portfolio.sqlite]=False
Exists[C:\iips-data\iips\user-portfolio.sqlite-wal]=False
Exists[C:\iips-data\iips\user-portfolio.sqlite-shm]=False
Exists[C:\iips-data\iips\user-portfolio.sqlite-journal]=False
EffectiveWriteProbe=PASS
WriteProbeCleanup=PASS
ProbeFileRemains=False
ConfiguredOneDriveRoot=C:\Users\USER\OneDrive
UnderConfiguredOneDriveRoot=False
Ancestor=C:\iips-data\iips;Attributes=Directory;IsReparsePoint=False
Ancestor=C:\iips-data;Attributes=Directory;IsReparsePoint=False
Ancestor=C:\;Attributes=Hidden, System, Directory;IsReparsePoint=False
WorktreeInventoryBegin
Worktree=C:/iips-work/iips-production-market-data
Worktree=C:/iips-work/iips-production-market-data-s2fix
Worktree=C:/iips-work/pf08-irr-clean-tree-20261026
Worktree=C:\iips-work\iips-production-market-data-s2fix
WorktreeInventoryEnd
OutsideEnumeratedIPDIRRWorktrees=True
WorktreeScope=IPD/IRR git worktree lists plus the known S2-fix worktree; does not assert exclusion from unrelated repositories elsewhere on host.
--- OUTPUT END ---

```

## `07-pf14-evidence-root.txt` — 408 bytes — SHA-256 `817ae418e958bc4a39ca5dc57c21c9388c84f4b3dfab6dfb3bf0409f6da6e559`

```text
Name=07-pf14-evidence-root
StartedUtc=2026-10-26T20:13:32.4512602Z
EndedUtc=2026-10-26T20:13:33.9854618Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
EvidenceRoot=C:\iips-evidence\cap03-p1-reconcile-20261026T201328Z
IsPathRooted=True
Exists=True
EvidenceRootIsNotStore=True
EvidenceBasePreExisted=True

DriveLetter    : C
FileSystemType : NTFS
DriveType      : Fixed
HealthStatus   : Healthy


--- OUTPUT END ---

```

## `08-pf15-designation-crosscheck.txt` — 432 bytes — SHA-256 `d6874071e9b58bf13a6e434872cd7a6a4cfa5e843e706fd049c48fb3ccd2fe12`

```text
Name=08-pf15-designation-crosscheck
StartedUtc=2026-10-26T20:13:33.9947341Z
EndedUtc=2026-10-26T20:13:34.0506351Z
CaptureStatus=PASS
--- OUTPUT BEGIN ---
EffectiveAct=IIPS-V3-CAP03-PF15-ENDPOINT-LOCAL-STATE-DESIGNATION-PA-ACT-2026-10-26-02
EffectiveBlob=3fe9a2ddd5f3b8730eccee7748b6266b5e2d8b1d
F4(verbatim)=C:\iips-data\iips\user-portfolio.sqlite
F2(verbatim)=\\.\pipe\iips-user-portfolio-v1
F3=N/A for Option A
--- OUTPUT END ---

```

## `98-script-integrity.txt` — 165 bytes — SHA-256 `69b1d6a0e810971c69795346909d1438b8557a65bb386968d72d68feb395a3a7`

```text
ScriptPath=C:\Users\USER\Downloads\CAP03_P1_ReadOnly_Preflight_Reconciliation_REV2.ps1
ScriptSHA256=CB7E674ED8E4DDFDB6F185204E1024743704623AD356632A7AAFE7BE6ED5C8B7

```

## `99-final-verdict.txt` — 321 bytes — SHA-256 `b3ff1b20d1484029accd844d6ccec5d664e7f173eb255653362a3dbcd57c7423`

```text
Verdict=PREFLIGHT CAPTURED — NOT AUTHORIZATION TO EXECUTE P-1
RunId=cap03-p1-reconcile-20261026T201328Z
EvidenceRoot=C:\iips-evidence\cap03-p1-reconcile-20261026T201328Z
P1Executed=False
P1AuthorizedByThisScript=False
Failures=0
StopConditions=0
Worktree exclusion scope is limited to the enumerated IPD/IRR worktrees.

```
