#Requires -Version 5.1
<#
  ============================================================================
  NP-18 - PHASE13-NEXT IMPLEMENTATION SCRIPT (FRESH RE-DERIVATION)
  REVISION 3 - CRLF-CORRECTED (fixes the Windows "anchor ABSENT" failure)
  ============================================================================
  Self-contained. Copy into the operator checkout root and run:

      powershell -ExecutionPolicy Bypass -File .\NP18-Phase13Next-Implement.ps1

  Creates exactly 6 new files and modifies exactly 6 existing files.
  TOTAL AUTHORIZED FILES = 12. No other file may change.

  THIS SCRIPT DOES NOT COMMIT AND DOES NOT PUSH.

  Governing R-2 authority : abac36b2f0d1d3ac7f8aa9c16d471b634e166d1a
  Product target          : branch phase13-next
  Required baseline       : 1a602d849cc47331d4f61cc366ed0a343f80e287

  --------------------------------------------------------------------------
  WHAT CHANGED IN REVISION 3 (and why)
  --------------------------------------------------------------------------
  Revision 2 failed on Windows at the FIRST existing-file mutation:

      FAIL: frontend/src/app/App.tsx :: import ROUTES
      anchor ABSENT

  Root cause, confirmed by forensics: a LINE-ENDING mismatch, not a bad
  anchor.

    * The repository contains NO .gitattributes, and core.autocrlf is unset,
      so Git for Windows' autocrlf=true default applies and the working tree
      is checked out with CRLF.
    * Every anchor in this script is LF.
    * All SIX anchor CONTENTS were correct - each occurs exactly once in the
      baseline. 14 of 16 fail to match a CRLF file purely because they cross
      a line boundary; the only 2 that matched are the 2 single-line anchors,
      which contain no embedded newline.
    * The blob gate PASSED while the anchor gate FAILED because
      'git hash-object' applies the clean filter (normalising CRLF to LF
      before hashing) and therefore still equals the committed LF blob,
      whereas a raw ordinal substring search performs no normalisation.

  THE FIX: every file read is normalised CRLF->LF before any comparison, and
  the comparator normalises again as a second line of defence. Reading is now
  regime-independent: the same script produces byte-identical committed
  content whether the checkout is LF or CRLF.

  ALREADY CORRECT IN REVISION 2 (unchanged here): Write-Utf8Lf always emits
  UTF-8 without BOM and LF-only, so the COMMITTED result was never at risk.

  Also added in revision 3:
    * Assert-LineEndings  - refuses a BOM or MIXED line endings, and prints
      a census of the six targets before any mutation.
    * Get-AnchorDiagnostic - on failure prints the file's actual CRLF/LF
      census and whether the anchor's first line is present at all, so a
      residual cause cannot hide behind a bare "anchor ABSENT".

  --------------------------------------------------------------------------
  WHY THIS SCRIPT IS PURE ASCII AND PURE POWERSHELL
  --------------------------------------------------------------------------
  * PURE ASCII.  Windows PowerShell 5.1 decodes a BOM-less .ps1 using the
    system ANSI codepage. Embedding the real non-ASCII characters that occur
    in the emitted sources would corrupt them on a non-UTF8 system. Those two
    codepoints are carried as ASCII placeholder tokens instead:

        @@MIDDOT@@  ->  U+00B7  MIDDLE DOT
        @@EMDASH@@  ->  U+2014  EM DASH

    They are expanded at write time via [char]0x00B7 / [char]0x2014, and the
    write fails closed if any '@@' token survives. The script therefore has
    ZERO external dependencies (no Python, no helper file to create/delete).

  * BYTE-SAFE I/O.  All reads and writes go through
    [System.IO.File]::ReadAllText / WriteAllText with an explicit encoding.
    Get-Content and Set-Content are NEVER used on source files.

  * NO FRAGILE MECHANICS.  No line numbers. No .Replace() with a third
    argument. No node -e. No git apply. No nested shell quoting. Every
    replacement is an ordinal, counted, exactly-once textual anchor held in a
    single-quoted here-string (so $ and backtick sequences are literal).

  * FAIL CLOSED.  Fail() terminates the process with exit code 1. That is
    deliberately STRONGER than throw: an exception raised by throw can be
    intercepted by an enclosing try/catch, whereas exit cannot. Nothing is
    reported as complete unless every gate passed.

  * No else / elseif anywhere in this script.
  ============================================================================
#>
[CmdletBinding()]
param(
    # Defaults to the directory holding this script (which is the repository
    # root when the script is copied to the checkout root as instructed),
    # falling back to the current directory.
    [string]$RepoRoot = ''
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = $PSScriptRoot }
if ([string]::IsNullOrWhiteSpace($RepoRoot)) { $RepoRoot = (Get-Location).Path }

$Baseline = '1a602d849cc47331d4f61cc366ed0a343f80e287'
$Branch   = 'phase13-next'
$RepoSlug = 'ramkivs/iips-review-recovered'

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$ModifyTargets = @(
    'frontend/src/app/App.tsx'
    'frontend/src/app/navigation.ts'
    'frontend/src/features/intelligence/IntelligenceHub.tsx'
    'frontend/src/app/navigation.test.ts'
    'frontend/src/app/Sidebar.test.tsx'
    'frontend/src/features/intelligence/IntelligenceHub.test.tsx'
)

$NewTargets = @(
    'frontend/src/features/intelligence/IntelligenceOpportunities.tsx'
    'frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx'
    'frontend/src/features/intelligence/IntelligenceRisks.tsx'
    'frontend/src/features/intelligence/IntelligenceRisks.test.tsx'
    'frontend/src/features/intelligence/IntelligenceRankings.tsx'
    'frontend/src/features/intelligence/IntelligenceRankings.test.tsx'
)

# Baseline git blobs of the six modification targets, re-derived from
# 1a602d849cc47331d4f61cc366ed0a343f80e287 with:  git rev-parse HEAD:<path>
# NOTE: hash-object applies the clean filter, so this gate is satisfied by a
# CRLF working tree as well as an LF one. It validates CONTENT, not bytes on
# disk. The byte-level gate is Assert-LineEndings plus the normalised reads.
$BaselineBlobs = @{
    'frontend/src/app/App.tsx'                                    = '15e638ed5b6f9448fcbb4b787783acd252fe0094'
    'frontend/src/app/navigation.ts'                              = '03fcf14d7db9f3dc1c75c8a08efec54d4ee2d4c2'
    'frontend/src/features/intelligence/IntelligenceHub.tsx'      = '25e215a40503108bb5821e92fd5f1582e9715cb1'
    'frontend/src/app/navigation.test.ts'                         = '41e4b06cebf634f68136b649965a37c58689a10a'
    'frontend/src/app/Sidebar.test.tsx'                           = '71c450b86f64718f51cd14be713595d63bd5c08c'
    'frontend/src/features/intelligence/IntelligenceHub.test.tsx' = '75458a96e02949f7d3b75be0fce2069436acf5c4'
}

# Paths that MUST NOT change. Verified by blob comparison against HEAD.
$ForbiddenPaths = @(
    'frontend/src/app/routes.ts'
    'frontend/src/api/crossSector.ts'
    'frontend/server/executive-transport.ts'
    'frontend/server/admin-transport.ts'
    'frontend/src/app/Sidebar.tsx'
    'docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md'
    'frontend/src/api/macro.ts'
    'frontend/src/features/research/MacroContext.tsx'
)

# ===========================================================================
#  helpers  (all defined before first use)
# ===========================================================================
function Fail([string]$msg) {
    Write-Host ''
    Write-Host ('  FAIL: ' + $msg) -ForegroundColor Red
    Write-Host ''
    exit 1
}
function Note([string]$msg) { Write-Host ('  ' + $msg) }
function Section([string]$msg) { Write-Host ''; Write-Host ('== ' + $msg) -ForegroundColor Cyan }
function Assert-Exit([int]$code, [string]$what) {
    if ($code -ne 0) { Fail ($what + ' failed with exit code ' + $code) }
}
function Expand-Tokens([string]$text) {
    $t = $text
    $t = $t.Replace('@@MIDDOT@@', [string][char]0x00B7)
    $t = $t.Replace('@@EMDASH@@', [string][char]0x2014)
    return $t
}
function Normalize-Lf([string]$text) {
    return $text.Replace("`r`n", "`n").Replace("`r", "`n")
}
function Read-Utf8([string]$abs) {
    if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) { Fail ('file not found: ' + $abs) }
    $raw = [System.IO.File]::ReadAllText($abs, [System.Text.Encoding]::UTF8)
    # REVISION 3 FIX: normalise CRLF -> LF on every read so that anchors,
    # which are authored with LF, match regardless of how git checked the
    # file out. Idempotent for an already-LF file.
    return (Normalize-Lf $raw)
}
function Write-Utf8Lf([string]$abs, [string]$content, [string]$label) {
    $c = Normalize-Lf (Expand-Tokens $content)
    if ($c.Contains('@@')) { Fail ('unexpanded placeholder token remains in ' + $label) }
    if (-not $c.EndsWith("`n")) { $c = $c + "`n" }
    [System.IO.File]::WriteAllText($abs, $c, $Utf8NoBom)
    if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) { Fail ('write did not produce ' + $label) }
    $back = [System.IO.File]::ReadAllBytes($abs)
    if ($back.Length -gt 2 -and $back[0] -eq 0xEF -and $back[1] -eq 0xBB -and $back[2] -eq 0xBF) { Fail ('BOM was written into ' + $label) }
    Note ('wrote  ' + $label)
}
function Get-AnchorDiagnostic([string]$text, [string]$anchor) {
    $crlf = ([regex]::Matches($text, "`r`n")).Count
    $lf   = ([regex]::Matches($text, "`n")).Count
    $first = ($anchor -split "`n")[0]
    $present = $text.Contains($first)
    return ('file CRLF=' + $crlf + ' LF=' + $lf + ' | anchor first line present=' + $present)
}
function Replace-Once([string]$text, [string]$anchor, [string]$replacement, [string]$label) {
    # REVISION 3 FIX: second line of defence - normalise the haystack too,
    # and refuse an anchor that itself carries a CR (which would be a bug in
    # this script, not in the checkout).
    $t = Normalize-Lf $text
    $a = Normalize-Lf (Expand-Tokens $anchor)
    $r = Normalize-Lf (Expand-Tokens $replacement)
    if ($a.Contains("`r")) { Fail ('anchor itself contains CR (' + $label + ') - script defect') }
    $count = ([regex]::Matches($t, [regex]::Escape($a))).Count
    if ($count -eq 0) { Fail ('anchor ABSENT (' + $label + ') - ' + (Get-AnchorDiagnostic $t $a)) }
    if ($count -gt 1) { Fail ('anchor DUPLICATED ' + $count + ' times (' + $label + ') - refusing an ambiguous edit') }
    $i = $t.IndexOf($a, [System.StringComparison]::Ordinal)
    Note ('anchor ok  ' + $label)
    return $t.Substring(0, $i) + $r + $t.Substring($i + $a.Length)
}
function Get-ChangedPaths([string]$r) {
    $raw = & git -C $r status --porcelain
    if ($LASTEXITCODE -ne 0) { Fail 'git status failed.' }
    $out = @()
    foreach ($line in @($raw)) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $out += $line.Substring(3).Trim()
    }
    return $out
}
function Assert-LineEndings([string]$r) {
    Section 'line-ending census of the six modification targets'
    foreach ($rel in $ModifyTargets) {
        $absF = Join-Path $r $rel
        if (-not (Test-Path -LiteralPath $absF -PathType Leaf)) { Fail ('missing modification target: ' + $rel) }
        $bytes = [System.IO.File]::ReadAllBytes($absF)
        $crlf = 0
        $lf = 0
        $idx = 0
        while ($idx -lt $bytes.Length) {
            if ($bytes[$idx] -eq 13) { $crlf++ }
            if ($bytes[$idx] -eq 10) { $lf++ }
            $idx++
        }
        $isBom = $false
        if ($bytes.Length -ge 3) {
            if ($bytes[0] -eq 0xEF) { if ($bytes[1] -eq 0xBB) { if ($bytes[2] -eq 0xBF) { $isBom = $true } } }
        }
        if ($isBom) { Fail ('BOM present in ' + $rel + ' - refusing to edit a BOM-bearing source') }
        $mode = 'LF'
        if ($crlf -gt 0) { $mode = 'CRLF' }
        if ($crlf -gt 0 -and $crlf -lt $lf) { Fail ('MIXED line endings in ' + $rel + ' (CRLF=' + $crlf + ' LF=' + $lf + ') - refusing an ambiguous edit') }
        Note ('  ' + $mode + '  CRLF=' + $crlf + ' LF=' + $lf + '  ' + $rel)
    }
    Note 'line endings are consistent; all reads are normalised to LF, so the'
    Note 'anchors below match in BOTH regimes and the committed result is LF-only.'
}
function Assert-Boundary([string]$r, [string]$when) {
    Section ('boundary check ' + $when)
    $changed = @(Get-ChangedPaths $r)
    Note ('changed paths = ' + $changed.Count)
    $expected = @($ModifyTargets + $NewTargets)
    $delta = @(Compare-Object -ReferenceObject $expected -DifferenceObject $changed)
    if ($delta.Count -ne 0) {
        foreach ($d in $delta) { Write-Host ('     ' + $d.SideIndicator + ' ' + $d.InputObject) }
        Fail ('the changed-file set is NOT the authorized 12-file boundary (' + $when + ')')
    }
    if ($changed.Count -ne 12) { Fail ('expected exactly 12 changed paths, found ' + $changed.Count + ' (' + $when + ')') }
    foreach ($p in $changed) {
        $bad = $false
        if ($p -like 'governance/*') { $bad = $true }
        if ($p -like 'governance\*') { $bad = $true }
        if ($p -like 'iips-platform/*') { $bad = $true }
        if ($p -like 'iips-platform\*') { $bad = $true }
        if ($bad) { Fail ('forbidden path was modified: ' + $p) }
    }
    Note 'boundary OK: exactly 6 modified + 6 new, 0 unauthorized, 0 forbidden'
}
function Assert-ForbiddenUnchanged([string]$r) {
    Section 'forbidden paths unchanged'
    foreach ($rel in $ForbiddenPaths) {
        $absF = Join-Path $r $rel
        if (-not (Test-Path -LiteralPath $absF -PathType Leaf)) { Note ('absent at baseline (ok)  ' + $rel); continue }
        $blob = (& git -C $r hash-object -- $rel).Trim()
        $headBlob = (& git -C $r rev-parse ('HEAD:' + $rel)).Trim()
        if ($blob -ne $headBlob) { Fail ('FORBIDDEN FILE CHANGED: ' + $rel) }
        Note ('unchanged  ' + $rel)
    }
}

# ===========================================================================
Section '1. repository identity'
# ===========================================================================
$gitVersion = & git --version 2>$null
if ($LASTEXITCODE -ne 0) { Fail 'git is not available on PATH.' }
Note ('git          : ' + $gitVersion)

$root = (& git -C $RepoRoot rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0) { Fail ('not a git work tree: ' + $RepoRoot) }
$root = $root.Trim()
$url = (& git -C $root remote get-url origin 2>$null).Trim()
if ($url -notmatch [regex]::Escape($RepoSlug)) { Fail ('origin is not ' + $RepoSlug + ' (got: ' + $url + ')') }
Note ('work tree    : ' + $root)
Note ('origin       : ' + $url)

# ===========================================================================
Section '2. branch / HEAD / remote / worktree'
# ===========================================================================
$actualBranch = (& git -C $root rev-parse --abbrev-ref HEAD).Trim()
if ($actualBranch -ne $Branch) { Fail ('on branch ' + $actualBranch + ', expected ' + $Branch) }
Note ('branch       : ' + $actualBranch)

$head = (& git -C $root rev-parse HEAD).Trim()
if ($head -ne $Baseline) { Fail ('HEAD is ' + $head + ', expected baseline ' + $Baseline) }
Note ('HEAD         : ' + $head)

$remoteSha = ((& git -C $root ls-remote origin ('refs/heads/' + $Branch) 2>$null | Out-String).Trim() -split '\s+')[0]
if ($remoteSha -ne $Baseline) { Fail ('remote ' + $Branch + ' is ' + $remoteSha + ', not the required baseline. If it has advanced, STOP and re-derive the boundary.') }
Note ('remote ' + $Branch + ' : ' + $remoteSha)

$dirtyText = (& git -C $root status --porcelain | Out-String).Trim()
if ($dirtyText.Length -ne 0) {
    Write-Host $dirtyText
    Fail 'worktree is NOT clean before mutation.'
}
Note 'worktree     : CLEAN (no staged, unstaged or untracked entries)'

# ===========================================================================
Section '3. the six modification targets exist and match the baseline content'
# ===========================================================================
foreach ($rel in $ModifyTargets) {
    $absF = Join-Path $root $rel
    if (-not (Test-Path -LiteralPath $absF -PathType Leaf)) { Fail ('missing modification target: ' + $rel) }
    $blob = (& git -C $root hash-object -- $rel).Trim()
    if ($blob -ne $BaselineBlobs[$rel]) { Fail ('baseline blob mismatch for ' + $rel + ' expected=' + $BaselineBlobs[$rel] + ' actual=' + $blob) }
    Note ('PRESENT + BASELINE MATCH  ' + $rel)
}

Section '3b. byte-level gate: line endings, BOM, mixed-ending refusal'
Assert-LineEndings $root

Section '4. the six new targets do not exist'
foreach ($rel in $NewTargets) {
    if (Test-Path -LiteralPath (Join-Path $root $rel)) { Fail ('new target already exists, refusing to overwrite: ' + $rel) }
    Note ('ABSENT (expected)  ' + $rel)
}

Assert-ForbiddenUnchanged $root

# ===========================================================================
Section '5. dependencies (installed BEFORE any mutation, so a dependency failure cannot leave a partial tree)'
# ===========================================================================
$Frontend = Join-Path $root 'frontend'
if (-not (Test-Path -LiteralPath $Frontend -PathType Container)) { Fail 'frontend/ directory not found.' }
$nodeModules = Join-Path $Frontend 'node_modules'
if (Test-Path -LiteralPath $nodeModules -PathType Container) {
    Note 'node_modules present - skipping install'
}
if (-not (Test-Path -LiteralPath $nodeModules -PathType Container)) {
    Note 'node_modules absent - running npm ci (does not touch tracked files)'
    Push-Location $Frontend
    & npm ci
    $code = $LASTEXITCODE
    Pop-Location
    Assert-Exit $code 'npm ci'
}
& node --version
Assert-Exit $LASTEXITCODE 'node --version'

# ===========================================================================
Section '6. create the six authorized NEW files'
# ===========================================================================

$NewOpportunities = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Opportunities (Discovery / Action view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are @@EMDASH@@ they
 * are not re-created, re-implemented, widened or altered here.
 *
 * SUBSET RELATIONSHIP @@EMDASH@@ STATED EXPLICITLY (this is the entire point of the surface):
 *   the rows below are the TOP-N SUBSET of the SAME certified `RankedOpportunity[]` slice
 *   that the Rankings surface renders in full.
 *   It is NOT an independent dataset, NOT a second source of truth, and NOT a new
 *   intelligence capability. Every row shown here is also contained in the Rankings view;
 *   nothing is recalculated, extended or invented. The framings are three views of one
 *   certified slice, not three datasets.
 *
 * Rules honoured: 1:1 payload mapping; certified order preserved verbatim (never re-sorted);
 * a certified `null` renders "unavailable" and is never turned into zero; the certified
 * provenance and its SNAPSHOT marker are shown verbatim and no current/streaming claim is
 * made; no new payload type, no new server route, no durable storage, no external data
 * source and no static sample data is introduced; no recomputation, normalization,
 * percentile, threshold, score, ordering or classification logic exists here; no sector is
 * hardcoded; no recommendation or interpretation is added beyond the payload.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCrossSectorData, type CrossSectorData } from '../../api/crossSector';
import { DataTable } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge } from '../../components/ui/Badges';

/** A certified `null` is shown as "unavailable" @@EMDASH@@ never as 0, never invented. */
function certified(value: number | null | undefined): string {
  return value === null || value === undefined ? 'unavailable' : String(value);
}

type OpportunityRow = CrossSectorData['opportunity'][number];

export function IntelligenceOpportunities() {
  const [data, setData] = useState<CrossSectorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCrossSectorData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load opportunities: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { opportunity, provenance } = data;

  return (
    <section aria-label="Intelligence opportunities">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Opportunities</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Discovery / Action framing view @@EMDASH@@ presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      {/* The subset relationship is declared before the rows, not implied by them. */}
      <p
        data-testid="opportunities-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        These rows are the <strong>top-N subset of the same <code>RankedOpportunity[]</code></strong> used by
        the <Link to="/intelligence/rankings">Rankings</Link> view, which renders that same certified slice in
        full. This is not an independent dataset. Certified order is preserved verbatim and nothing here is
        recomputed.
      </p>

      <DataTable
        columns={[
          { key: 'companyId', header: 'Company', render: (r: OpportunityRow) => r.companyId },
          {
            key: 'sector',
            header: 'Sector',
            render: (r: OpportunityRow) => (
              <Link to={`/research/company/${r.sector}`}>{r.sector}</Link>
            ),
          },
          { key: 'conviction', header: 'Certified Conviction', render: (r: OpportunityRow) => certified(r.conviction) },
        ]}
        rows={opportunity}
        emptyLabel="No certified opportunities available"
      />

      <p data-testid="opportunities-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} @@MIDDOT@@ freshness {provenance.freshness} @@MIDDOT@@ mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
'@

$NewOpportunitiesTest = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Opportunities tests (Discovery / Action view).
 *
 * Verifies: rows map 1:1 from the certified `opportunity` slice served over the existing
 * guarded cross-sector path; the certified order is preserved verbatim (never re-sorted);
 * the top-N subset relationship to the SAME certified slice the Rankings view renders in
 * full is stated explicitly; no sector is hardcoded; a certified null renders "unavailable"
 * and is never turned into 0; provenance is shown verbatim with its SNAPSHOT marker; and the
 * governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceOpportunities } from './IntelligenceOpportunities';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-1', scenario: 'Balanced', holdings: 3, avgConviction: 65, avgQuality: 70, avgRisk: 45, concentration: 61, diversificationScore: 99 },
  diversification: { band: 'Good', flags: ['sector spread adequate'] },
  ranking: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
    { companyId: 'Gamma-H1', sector: 'Gamma', conviction: 52 },
  ],
  opportunity: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Beta'] },
  decisions: [{ sector: 'Alpha', verdict: 'Buy', composite: 80, confidence: 0.8 }],
  provenance: { dataSource: 'test payload (not certified data)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function urlAwareMock(payload: CrossSectorData = PAYLOAD, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/cross-sector')) {
      if (opts.fails) return Promise.reject(new Error('cross-sector down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/intelligence/opportunities']}>
      <IntelligenceOpportunities />
    </MemoryRouter>,
  );
}

function bodyRows() {
  return screen.getByTestId('data-table').querySelectorAll('tbody tr');
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Opportunities @@EMDASH@@ Discovery / Action framing view', () => {
  it('reads the existing guarded cross-sector path and maps one row per certified entry', async () => {
    const spy = urlAwareMock();
    globalThis.fetch = spy as never;
    renderView();
    expect(await screen.findByText('Alpha-H1')).toBeInTheDocument();
    expect(spy.mock.calls[0]?.[0]).toBe('/api/cross-sector');
    expect(bodyRows()).toHaveLength(PAYLOAD.opportunity.length);
  });

  it('preserves the certified order verbatim (never re-sorts the slice)', async () => {
    const outOfOrder: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [
        { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
        { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
      ],
    };
    globalThis.fetch = urlAwareMock(outOfOrder) as never;
    renderView();
    await screen.findByText('Beta-H1');
    const companies = [...bodyRows()].map((r) => r.querySelector('td')?.textContent);
    expect(companies).toEqual(['Beta-H1', 'Alpha-H1']);
  });

  it('states the top-N subset relationship to the same certified slice the Rankings view renders in full', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Alpha-H1');
    const framing = screen.getByTestId('opportunities-framing');
    expect(framing).toHaveTextContent(/top-N subset/i);
    expect(framing).toHaveTextContent(/RankedOpportunity/);
    expect(framing).toHaveTextContent(/not an independent dataset/i);
    expect(within(framing).getByRole('link', { name: 'Rankings' })).toHaveAttribute('href', '/intelligence/rankings');
  });

  it('does not hardcode sectors (payload sectors appear verbatim)', async () => {
    const custom: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [
        { companyId: 'Zeta-H1', sector: 'Zeta', conviction: 90 },
        { companyId: 'Omega-H1', sector: 'Omega', conviction: 40 },
      ],
    };
    globalThis.fetch = urlAwareMock(custom) as never;
    renderView();
    await screen.findByText('Zeta-H1');
    expect(screen.getByText('Omega-H1')).toBeInTheDocument();
    expect(screen.queryByText('Banking')).not.toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('renders a certified null as "unavailable" and never converts it to zero', async () => {
    const withNull: CrossSectorData = {
      ...PAYLOAD,
      opportunity: [{ companyId: 'Alpha-H1', sector: 'Alpha', conviction: null as unknown as number }],
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Alpha-H1');
    const table = screen.getByTestId('data-table');
    expect(within(table).getByText('unavailable')).toBeInTheDocument();
    expect(within(table).queryByText('0')).not.toBeInTheDocument();
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Alpha-H1');
    expect(screen.getByTestId('opportunities-provenance').textContent).toBe(
      'test payload (not certified data) @@MIDDOT@@ freshness SNAPSHOT @@MIDDOT@@ mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load opportunities');
  });
});
'@

$NewRisks = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Risks (Portfolio Risk view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are @@EMDASH@@ they
 * are not re-created, re-implemented, widened or altered here.
 *
 * CERTIFIED AGGREGATES ONLY @@EMDASH@@ this surface renders exactly four things, 1:1 from the payload
 * and in the payload's own words:
 *   portfolio.avgRisk @@MIDDOT@@ diversification.flags @@MIDDOT@@ correlation.flags @@MIDDOT@@
 *   correlation.concentrationSectors
 * Nothing else is shown. There is NO per-company risk, NO per-sector risk and NO newly
 * calculated risk: no risk value is derived, re-weighted, scaled, scored, banded or
 * classified here, and no company-level or sector-level risk figure is exposed or inferred.
 * The allocation detail carried elsewhere in the certified model is deliberately not
 * surfaced by this view.
 *
 * Rules honoured: 1:1 payload mapping; certified order and wording preserved verbatim; a
 * certified `null` renders "unavailable" and is never turned into zero; the certified
 * provenance and its SNAPSHOT marker are shown verbatim and no current/streaming claim is
 * made; no new payload type, no new server route, no durable storage, no external data
 * source and no static sample data is introduced; no recomputation, normalization,
 * percentile, threshold, score, ordering or classification logic exists here; no sector is
 * hardcoded; no recommendation or interpretation is added beyond the payload.
 */
import { useEffect, useState } from 'react';
import { fetchCrossSectorData, type CrossSectorData } from '../../api/crossSector';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge } from '../../components/ui/Badges';

export function IntelligenceRisks() {
  const [data, setData] = useState<CrossSectorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCrossSectorData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load portfolio risk: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { portfolio, diversification, correlation, provenance } = data;

  return (
    <section aria-label="Intelligence risks">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Risks</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Portfolio Risk framing view @@EMDASH@@ presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      <p
        data-testid="risks-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        Aggregate portfolio risk only, taken 1:1 from the certified payload. No per-company risk, no
        per-sector risk and no newly calculated risk is shown or derived; certified values and their
        wording are never recomputed, re-based, re-banded or reclassified.
      </p>

      <MetricGroup label="Portfolio Risk">
        <MetricCard label="Avg Risk" value={portfolio.avgRisk} />
      </MetricGroup>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Diversification Flags</h2>
      <ul data-testid="risks-diversification-flags" style={{ paddingLeft: 20 }}>
        {diversification.flags.length > 0
          ? diversification.flags.map((f) => <li key={f}>{f}</li>)
          : <li>No certified diversification flags</li>}
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Correlation Flags</h2>
      <ul data-testid="risks-correlation-flags" style={{ paddingLeft: 20 }}>
        {correlation.flags.length > 0
          ? correlation.flags.map((f) => <li key={f}>{f}</li>)
          : <li>No certified correlation flags</li>}
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 24 }}>Concentration Sectors</h2>
      <ul data-testid="risks-concentration-sectors" style={{ paddingLeft: 20 }}>
        {correlation.concentrationSectors.length > 0
          ? correlation.concentrationSectors.map((s) => <li key={s}>{s}</li>)
          : <li>No certified concentration sectors</li>}
      </ul>

      <p data-testid="risks-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} @@MIDDOT@@ freshness {provenance.freshness} @@MIDDOT@@ mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
'@

$NewRisksTest = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Risks tests (Portfolio Risk view).
 *
 * Verifies: only the four certified aggregate inputs are rendered (portfolio.avgRisk,
 * diversification.flags, correlation.flags, correlation.concentrationSectors) and nothing
 * else from the payload leaks onto the surface; no per-company and no per-sector risk is
 * exposed; flags render 1:1 in certified wording; provenance is shown verbatim with its
 * SNAPSHOT marker; and the governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceRisks } from './IntelligenceRisks';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-9', scenario: 'Defensive', holdings: 7, avgConviction: 64, avgQuality: 72, avgRisk: 58, concentration: 63, diversificationScore: 91 },
  diversification: { band: 'Strong', flags: ['sector spread adequate', 'single-name weight bounded'] },
  ranking: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  opportunity: [{ companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 }],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Beta', 'Gamma'] },
  decisions: [{ sector: 'Alpha', verdict: 'Buy', composite: 80, confidence: 0.8 }],
  provenance: { dataSource: 'test payload (not certified data)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function urlAwareMock(payload: CrossSectorData = PAYLOAD, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/cross-sector')) {
      if (opts.fails) return Promise.reject(new Error('cross-sector down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/intelligence/risks']}>
      <IntelligenceRisks />
    </MemoryRouter>,
  );
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Risks @@EMDASH@@ Portfolio Risk framing view', () => {
  it('renders the certified aggregate avgRisk and nothing else from the portfolio block', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    expect(await screen.findByText('Avg Risk')).toBeInTheDocument();
    expect(screen.getByText('58')).toBeInTheDocument();
    for (const absent of ['PF-9', 'Defensive', '64', '72', '63', '91']) {
      expect(screen.queryByText(absent)).not.toBeInTheDocument();
    }
    expect(screen.queryByText('Strong')).not.toBeInTheDocument();
  });

  it('renders diversification flags, correlation flags and concentration sectors 1:1', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');

    const divFlags = screen.getByTestId('risks-diversification-flags');
    expect(divFlags.querySelectorAll('li')).toHaveLength(2);
    expect(within(divFlags).getByText('sector spread adequate')).toBeInTheDocument();
    expect(within(divFlags).getByText('single-name weight bounded')).toBeInTheDocument();

    const corrFlags = screen.getByTestId('risks-correlation-flags');
    expect(corrFlags.querySelectorAll('li')).toHaveLength(1);
    expect(within(corrFlags).getByText('pairwise correlation elevated')).toBeInTheDocument();

    const sectors = screen.getByTestId('risks-concentration-sectors');
    expect(sectors.querySelectorAll('li')).toHaveLength(2);
    expect(within(sectors).getByText('Beta')).toBeInTheDocument();
    expect(within(sectors).getByText('Gamma')).toBeInTheDocument();
  });

  it('exposes no per-company and no per-sector risk (no company identity leaks onto the surface)', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');
    expect(screen.queryByText('Alpha-H1')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta-H1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Buy')).not.toBeInTheDocument();
    expect(screen.queryByText('80')).not.toBeInTheDocument();
  });

  it('renders a certified null aggregate as "unavailable" and never converts it to zero', async () => {
    const withNull: CrossSectorData = {
      ...PAYLOAD,
      portfolio: { ...PAYLOAD.portfolio, avgRisk: null as unknown as number },
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Avg Risk');
    const value = screen.getByTestId('metric-value');
    expect(value).toHaveTextContent('unavailable');
    expect(value).not.toHaveTextContent('0');
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Avg Risk');
    expect(screen.getByTestId('risks-provenance').textContent).toBe(
      'test payload (not certified data) @@MIDDOT@@ freshness SNAPSHOT @@MIDDOT@@ mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load portfolio risk');
  });
});
'@

$NewRankings = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Rankings (Ordered Comparison view).
 *
 * One of the three authorized NP-18 framing views (D-1a = A). This surface is presentation
 * ONLY over the existing certified cross-sector payload, reached through the existing client
 * call (`fetchCrossSectorData`) against the existing guarded `/api/cross-sector` path. That
 * path and its existing read-authorization hardening are reused exactly as they are @@EMDASH@@ they
 * are not re-created, re-implemented, widened or altered here.
 *
 * ORDERED COMPARISON @@EMDASH@@ THE CERTIFIED ORDER IS THE PRODUCT:
 *   rows are rendered in the exact array order the certified payload supplies. The view never
 *   re-sorts, never re-ranks, never computes a position or ordinal, and never derives a
 *   comparison beyond presenting the certified slice as given.
 *
 * RELATIONSHIP TO THE OTHER FRAMINGS (stated explicitly, not implied): this view renders the
 * SAME certified `RankedOpportunity[]` slice that the Opportunities surface presents as its
 * top-N subset. One certified slice, three framings @@EMDASH@@ not three datasets, and not three
 * sources of truth.
 *
 * Rules honoured: 1:1 payload mapping; certified order preserved verbatim; a certified `null`
 * renders "unavailable" and is never turned into zero; the certified provenance and its
 * SNAPSHOT marker are shown verbatim and no current/streaming claim is made; no new payload
 * type, no new server route, no durable storage, no external data source and no static sample
 * data is introduced; no recomputation, normalization, percentile, threshold, score, ordering
 * or classification logic exists here; no sector is hardcoded; no recommendation or
 * interpretation is added beyond the payload.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCrossSectorData, type CrossSectorData } from '../../api/crossSector';
import { DataTable } from '../../components/data/DataComponents';
import { LoadingState, ErrorState, UnavailableState } from '../../components/state/StateComponents';
import { CertifiedBadge } from '../../components/ui/Badges';

/** A certified `null` is shown as "unavailable" @@EMDASH@@ never as 0, never invented. */
function certified(value: number | null | undefined): string {
  return value === null || value === undefined ? 'unavailable' : String(value);
}

type RankingRow = CrossSectorData['ranking'][number];

export function IntelligenceRankings() {
  const [data, setData] = useState<CrossSectorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCrossSectorData()
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={`Unable to load rankings: ${error}`} />;
  if (!data) return <UnavailableState />;

  const { ranking, provenance } = data;

  return (
    <section aria-label="Intelligence rankings">
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Rankings</h1>
          <CertifiedBadge />
        </div>
        <p style={{ color: 'var(--color-ink-secondary)', margin: '8px 0 0', fontSize: 13 }}>
          Ordered Comparison framing view @@EMDASH@@ presentation over the existing certified cross-sector
          data, not a separate intelligence capability.
        </p>
      </header>

      <p
        data-testid="rankings-framing"
        style={{ fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12, background: 'var(--color-surface-1)' }}
      >
        The full certified <code>RankedOpportunity[]</code> slice, in the certified order supplied by the
        payload: rows are never re-sorted and no position is derived here. The{' '}
        <Link to="/intelligence/opportunities">Opportunities</Link> view presents the top-N subset of this
        same slice @@EMDASH@@ one certified dataset, two framings.
      </p>

      <DataTable
        columns={[
          { key: 'companyId', header: 'Company', render: (r: RankingRow) => r.companyId },
          {
            key: 'sector',
            header: 'Sector',
            render: (r: RankingRow) => (
              <Link to={`/research/company/${r.sector}`}>{r.sector}</Link>
            ),
          },
          { key: 'conviction', header: 'Certified Conviction', render: (r: RankingRow) => certified(r.conviction) },
        ]}
        rows={ranking}
        emptyLabel="No certified ranking available"
      />

      <p data-testid="rankings-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 16 }}>
        {provenance.dataSource} @@MIDDOT@@ freshness {provenance.freshness} @@MIDDOT@@ mapping {provenance.transportSemantics}
      </p>
    </section>
  );
}
'@

$NewRankingsTest = @'
/**
 * Program v3.0 @@EMDASH@@ NP-18: Intelligence @@EMDASH@@ Rankings tests (Ordered Comparison view).
 *
 * Verifies: rows map 1:1 from the certified `ranking` slice; the certified order is
 * preserved verbatim and is NEVER re-sorted (proved with a payload whose order is not
 * conviction-descending); the shared-slice relationship with the Opportunities framing is
 * stated explicitly; no sector is hardcoded; a certified null renders "unavailable" and is
 * never turned into 0; provenance is shown verbatim with its SNAPSHOT marker; and the
 * governed error state renders when the call fails.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IntelligenceRankings } from './IntelligenceRankings';
import type { CrossSectorData } from '../../api/crossSector';

const PAYLOAD: CrossSectorData = {
  portfolio: { portfolioId: 'PF-1', scenario: 'Balanced', holdings: 3, avgConviction: 65, avgQuality: 70, avgRisk: 45, concentration: 61, diversificationScore: 99 },
  diversification: { band: 'Good', flags: ['sector spread adequate'] },
  ranking: [
    { companyId: 'Gamma-H1', sector: 'Gamma', conviction: 52 },
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  opportunity: [
    { companyId: 'Alpha-H1', sector: 'Alpha', conviction: 88 },
    { companyId: 'Beta-H1', sector: 'Beta', conviction: 71 },
  ],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Beta'] },
  decisions: [{ sector: 'Alpha', verdict: 'Buy', composite: 80, confidence: 0.8 }],
  provenance: { dataSource: 'test payload (not certified data)', freshness: 'SNAPSHOT', calibratedAt: '2026-08-01T00:00:00.000Z', transportSemantics: '1:1' },
};

function urlAwareMock(payload: CrossSectorData = PAYLOAD, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/cross-sector')) {
      if (opts.fails) return Promise.reject(new Error('cross-sector down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/intelligence/rankings']}>
      <IntelligenceRankings />
    </MemoryRouter>,
  );
}

function bodyRows() {
  return screen.getByTestId('data-table').querySelectorAll('tbody tr');
}

beforeEach(() => { globalThis.fetch = vi.fn() as never; });

describe('Intelligence Rankings @@EMDASH@@ Ordered Comparison framing view', () => {
  it('reads the existing guarded cross-sector path and maps one row per certified entry', async () => {
    const spy = urlAwareMock();
    globalThis.fetch = spy as never;
    renderView();
    expect(await screen.findByText('Gamma-H1')).toBeInTheDocument();
    expect(spy.mock.calls[0]?.[0]).toBe('/api/cross-sector');
    expect(bodyRows()).toHaveLength(PAYLOAD.ranking.length);
  });

  it('preserves the certified ordering verbatim (no re-sort, no derived position)', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const companies = [...bodyRows()].map((r) => r.querySelector('td')?.textContent);
    expect(companies).toEqual(['Gamma-H1', 'Alpha-H1', 'Beta-H1']);
  });

  it('states that it renders the same certified slice the Opportunities view subsets', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const framing = screen.getByTestId('rankings-framing');
    expect(framing).toHaveTextContent(/RankedOpportunity/);
    expect(framing).toHaveTextContent(/never re-sorted/i);
    expect(within(framing).getByRole('link', { name: 'Opportunities' })).toHaveAttribute('href', '/intelligence/opportunities');
  });

  it('does not hardcode sectors (payload sectors appear verbatim)', async () => {
    const custom: CrossSectorData = {
      ...PAYLOAD,
      ranking: [
        { companyId: 'Zeta-H1', sector: 'Zeta', conviction: 60 },
        { companyId: 'Omega-H1', sector: 'Omega', conviction: 30 },
      ],
    };
    globalThis.fetch = urlAwareMock(custom) as never;
    renderView();
    await screen.findByText('Zeta-H1');
    expect(screen.getByText('Omega-H1')).toBeInTheDocument();
    expect(screen.queryByText('Banking')).not.toBeInTheDocument();
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
  });

  it('renders a certified null as "unavailable" and never converts it to zero', async () => {
    const withNull: CrossSectorData = {
      ...PAYLOAD,
      ranking: [{ companyId: 'Gamma-H1', sector: 'Gamma', conviction: null as unknown as number }],
    };
    globalThis.fetch = urlAwareMock(withNull) as never;
    renderView();
    await screen.findByText('Gamma-H1');
    const table = screen.getByTestId('data-table');
    expect(within(table).getByText('unavailable')).toBeInTheDocument();
    expect(within(table).queryByText('0')).not.toBeInTheDocument();
  });

  it('shows provenance verbatim, SNAPSHOT intact, with nothing appended to the certified marker', async () => {
    globalThis.fetch = urlAwareMock() as never;
    renderView();
    await screen.findByText('Gamma-H1');
    expect(screen.getByTestId('rankings-provenance').textContent).toBe(
      'test payload (not certified data) @@MIDDOT@@ freshness SNAPSHOT @@MIDDOT@@ mapping 1:1',
    );
  });

  it('renders the governed error state when the cross-sector call fails', async () => {
    globalThis.fetch = urlAwareMock(PAYLOAD, { fails: true }) as never;
    renderView();
    expect(await screen.findByTestId('state-error')).toHaveTextContent('Unable to load rankings');
  });
});
'@

Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceOpportunities.tsx')      $NewOpportunities     'IntelligenceOpportunities.tsx'
Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceOpportunities.test.tsx') $NewOpportunitiesTest 'IntelligenceOpportunities.test.tsx'
Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceRisks.tsx')              $NewRisks             'IntelligenceRisks.tsx'
Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceRisks.test.tsx')         $NewRisksTest         'IntelligenceRisks.test.tsx'
Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceRankings.tsx')           $NewRankings          'IntelligenceRankings.tsx'
Write-Utf8Lf (Join-Path $root 'frontend/src/features/intelligence/IntelligenceRankings.test.tsx')      $NewRankingsTest      'IntelligenceRankings.test.tsx'

# ===========================================================================
Section '7. modify the six authorized EXISTING files (each anchor must occur exactly once)'
# ===========================================================================

# --- MODIFY 1/6 : frontend/src/app/App.tsx ---------------------------------
$rel = 'frontend/src/app/App.tsx'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor1 = @'
import { AppShell } from './AppShell';
import { NotYetAuthorized } from '../components/shell/ShellStates';
'@
$replacement1 = @'
import { AppShell } from './AppShell';
import { ROUTES } from './routes';
import { NotYetAuthorized } from '../components/shell/ShellStates';
'@
$t = Replace-Once $t $anchor1 $replacement1 "$rel :: import ROUTES"

$anchor2 = @'
const IntelligenceHub = lazy(() => import('../features/intelligence/IntelligenceHub').then((m) => ({ default: m.IntelligenceHub })));
'@
$replacement2 = @'
const IntelligenceHub = lazy(() => import('../features/intelligence/IntelligenceHub').then((m) => ({ default: m.IntelligenceHub })));
// NP-18: the three authorized Intelligence framing views over the SAME certified
// cross-sector slice (Discovery / Action, Portfolio Risk, Ordered Comparison).
const IntelligenceOpportunities = lazy(() => import('../features/intelligence/IntelligenceOpportunities').then((m) => ({ default: m.IntelligenceOpportunities })));
const IntelligenceRisks = lazy(() => import('../features/intelligence/IntelligenceRisks').then((m) => ({ default: m.IntelligenceRisks })));
const IntelligenceRankings = lazy(() => import('../features/intelligence/IntelligenceRankings').then((m) => ({ default: m.IntelligenceRankings })));
'@
$t = Replace-Once $t $anchor2 $replacement2 "$rel :: lazy imports"

$anchor3 = @'
        <Route path="/intelligence/decision-matrix" element={<Lazy><DecisionMatrix /></Lazy>} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
'@
$replacement3 = @'
        <Route path="/intelligence/decision-matrix" element={<Lazy><DecisionMatrix /></Lazy>} />
        {/* NP-18: the three implemented Intelligence framing views, declared before the
            /intelligence/* catch-all so they resolve to their surfaces, using the existing
            route identifiers from routes.ts (which is not modified). */}
        <Route path={ROUTES.intelligenceOpportunities} element={<Lazy><IntelligenceOpportunities /></Lazy>} />
        <Route path={ROUTES.intelligenceRisks} element={<Lazy><IntelligenceRisks /></Lazy>} />
        <Route path={ROUTES.intelligenceRankings} element={<Lazy><IntelligenceRankings /></Lazy>} />
        <Route path="/intelligence/*" element={<FeaturePlaceholder surface="Intelligence" />} />
'@
$t = Replace-Once $t $anchor3 $replacement3 "$rel :: intelligence routes"
Write-Utf8Lf $abs $t $rel

# --- MODIFY 2/6 : frontend/src/app/navigation.ts ---------------------------
$rel = 'frontend/src/app/navigation.ts'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor4 = @'
 * rendered by the Sidebar as non-navigable text with a Future badge (never links).
 */
'@
$replacement4 = @'
 * rendered by the Sidebar as non-navigable text with a Future badge (never links).
 *
 * Milestone NP-18 (Intelligence Exposure Implementation): the Intelligence group and its
 * Opportunities / Risks / Rankings children move to `implemented` @@EMDASH@@ the three authorized
 * framing views are implemented as presentation-only projections of the SAME certified
 * cross-sector payload. The `future` member of NavStatus and its NAV_STATUS_LABEL entry are
 * preserved unchanged: the honest-marker machinery is neither narrowed nor removed.
 */
'@
$t = Replace-Once $t $anchor4 $replacement4 "$rel :: docblock"

$anchor5 = @'
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
    status: 'partial',
    children: [
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix', minRole: 'viewer', status: 'implemented' },
      { label: 'Opportunities', path: '/intelligence/opportunities', minRole: 'viewer', status: 'future' },
      { label: 'Risks', path: '/intelligence/risks', minRole: 'viewer', status: 'future' },
      { label: 'Rankings', path: '/intelligence/rankings', minRole: 'viewer', status: 'future' },
    ],
'@
$replacement5 = @'
    label: 'Intelligence',
    path: '/intelligence',
    minRole: 'viewer',
    status: 'implemented',
    children: [
      { label: 'Decision Matrix', path: '/intelligence/decision-matrix', minRole: 'viewer', status: 'implemented' },
      { label: 'Opportunities', path: '/intelligence/opportunities', minRole: 'viewer', status: 'implemented' },
      { label: 'Risks', path: '/intelligence/risks', minRole: 'viewer', status: 'implemented' },
      { label: 'Rankings', path: '/intelligence/rankings', minRole: 'viewer', status: 'implemented' },
    ],
'@
$t = Replace-Once $t $anchor5 $replacement5 "$rel :: intelligence group status"
Write-Utf8Lf $abs $t $rel

# --- MODIFY 3/6 : frontend/src/features/intelligence/IntelligenceHub.tsx --
$rel = 'frontend/src/features/intelligence/IntelligenceHub.tsx'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor6 = @'
 * primary entry links to the implemented Decision Matrix and Cross-Sector surfaces. Future
 * intelligence surfaces (Opportunities / Risks / Rankings) are marked honestly @@EMDASH@@ no links, no
 * fabricated data. Never hardcodes sectors, never recomputes, never derives values.
 */
'@
$replacement6 = @'
 * primary entry links to the implemented Decision Matrix and Cross-Sector surfaces, plus
 * genuine entry points to the three implemented NP-18 framing views (Opportunities / Risks /
 * Rankings) over the SAME certified cross-sector payload @@EMDASH@@ no additional intelligence
 * capability is created here, and no fabricated data is ever shown. Never hardcodes sectors,
 * never recomputes, never derives values.
 */
'@
$t = Replace-Once $t $anchor6 $replacement6 "$rel :: docblock"

$anchor7 = @'
      {/* Future intelligence surfaces (honest markers @@EMDASH@@ no links, no fabrication) */}
      <h2 style={{ fontSize: 18, marginTop: 8 }}>Future Intelligence Surfaces</h2>
      <p data-testid="intelligence-future" style={{ fontSize: 13, color: 'var(--color-ink-secondary)', marginTop: 0 }}>
        Opportunities @@MIDDOT@@ Risks @@MIDDOT@@ Rankings @@EMDASH@@ future Program v3.0 surfaces (not yet implemented).
      </p>
'@
$replacement7 = @'
      {/* NP-18: the three implemented framing views over the SAME certified cross-sector
          payload. These are genuine entry points to implemented surfaces @@EMDASH@@ the hub creates
          no intelligence capability of its own. */}
      <h2 style={{ fontSize: 18, marginTop: 8 }}>Intelligence Views</h2>
      <div data-testid="intelligence-views" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Link to="/intelligence/opportunities" style={{ padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-1)', textDecoration: 'none', color: 'var(--color-ink)' }}>
          Opportunities
        </Link>
        <Link to="/intelligence/risks" style={{ padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-1)', textDecoration: 'none', color: 'var(--color-ink)' }}>
          Risks
        </Link>
        <Link to="/intelligence/rankings" style={{ padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: 6, background: 'var(--color-surface-1)', textDecoration: 'none', color: 'var(--color-ink)' }}>
          Rankings
        </Link>
      </div>
'@
$t = Replace-Once $t $anchor7 $replacement7 "$rel :: views entry points"
Write-Utf8Lf $abs $t $rel

# --- MODIFY 4/6 : frontend/src/app/navigation.test.ts ----------------------
$rel = 'frontend/src/app/navigation.test.ts'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor8 = @'
  it('marks Research / Intelligence / Evidence as partial (module-level scope future)', () => {
    expect(byLabel['Research'].status).toBe('partial');
    expect(byLabel['Intelligence'].status).toBe('partial');
    expect(byLabel['Evidence'].status).toBe('partial');
  });
'@
$replacement8 = @'
  it('marks Research / Intelligence / Evidence status honestly (NP-18: Intelligence implemented)', () => {
    expect(byLabel['Research'].status).toBe('partial');
    expect(byLabel['Evidence'].status).toBe('partial');
    // NP-18: the Intelligence group is now implemented @@EMDASH@@ its three framing views
    // (Opportunities / Risks / Rankings) are implemented surfaces.
    expect(byLabel['Intelligence'].status).toBe('implemented');
  });
'@
$t = Replace-Once $t $anchor8 $replacement8 "$rel :: top-level status"

$anchor9 = @'
  it('marks future-only children as future (never implemented)', () => {
    const statusOf = (group: string, label: string) =>
      childrenOf(group).find((c) => c.label === label)?.status;
    expect(statusOf('Intelligence', 'Opportunities')).toBe('future');
    expect(statusOf('Intelligence', 'Risks')).toBe('future');
    expect(statusOf('Intelligence', 'Rankings')).toBe('future');
  });
'@
$replacement9 = @'
  it('NP-18: marks the Intelligence children implemented @@EMDASH@@ no future-only child remains', () => {
    const statusOf = (group: string, label: string) =>
      childrenOf(group).find((c) => c.label === label)?.status;
    expect(statusOf('Intelligence', 'Opportunities')).toBe('implemented');
    expect(statusOf('Intelligence', 'Risks')).toBe('implemented');
    expect(statusOf('Intelligence', 'Rankings')).toBe('implemented');
    // The honest-marker machinery is preserved: now that every declared surface is
    // implemented, nothing claims `future` @@EMDASH@@ and nothing over-claims by omission.
    const walk = (items: NavItem[]): NavItem[] =>
      items.flatMap((i) => [i, ...(i.children ? walk(i.children) : [])]);
    expect(walk(NAV).filter((n) => n.status === 'future')).toHaveLength(0);
  });
'@
$t = Replace-Once $t $anchor9 $replacement9 "$rel :: future children"
Write-Utf8Lf $abs $t $rel

# --- MODIFY 5/6 : frontend/src/app/Sidebar.test.tsx ------------------------
$rel = 'frontend/src/app/Sidebar.test.tsx'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor10 = @'
    expect(screen.getByTestId('nav-status-Research')).toHaveTextContent('Partial');
    expect(screen.getByTestId('nav-status-Intelligence')).toHaveTextContent('Partial');
    expect(screen.getByTestId('nav-status-Evidence')).toHaveTextContent('Partial');
'@
$replacement10 = @'
    expect(screen.getByTestId('nav-status-Research')).toHaveTextContent('Partial');
    expect(screen.getByTestId('nav-status-Evidence')).toHaveTextContent('Partial');
    // NP-18: Intelligence is now implemented, so its badge is gone @@EMDASH@@ badges are rendered
    // for non-implemented surfaces only.
    expect(screen.queryByTestId('nav-status-Intelligence')).not.toBeInTheDocument();
'@
$t = Replace-Once $t $anchor10 $replacement10 "$rel :: partial badge"

$anchor11 = @'
  it('shows Future badges on future-only children', () => {
    renderSidebar('analyst');
    expect(screen.getByTestId('nav-status-Opportunities')).toHaveTextContent('Future');
    expect(screen.getByTestId('nav-status-Risks')).toHaveTextContent('Future');
  });
'@
$replacement11 = @'
  it('NP-18: shows no Future badge for the now-implemented Intelligence children', () => {
    renderSidebar('analyst');
    expect(screen.queryByTestId('nav-status-Opportunities')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-status-Risks')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-status-Rankings')).not.toBeInTheDocument();
  });
'@
$t = Replace-Once $t $anchor11 $replacement11 "$rel :: future badges"

$anchor12 = @'
  it('N+17: renders future-only children as non-navigable text (never links)', () => {
    renderSidebar('analyst');
    expect(screen.getByTestId('nav-future-Opportunities')).toHaveTextContent('Opportunities');
    expect(screen.getByTestId('nav-future-Risks')).toHaveTextContent('Risks');
    expect(screen.getByTestId('nav-future-Rankings')).toHaveTextContent('Rankings');
    expect(screen.queryByRole('link', { name: 'Opportunities' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Risks' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Rankings' })).not.toBeInTheDocument();
  });
'@
$replacement12 = @'
  it('NP-18: renders the implemented Intelligence children as navigable links (no future placeholders)', () => {
    renderSidebar('analyst');
    expect(screen.getByRole('link', { name: 'Opportunities' })).toHaveAttribute('href', '/intelligence/opportunities');
    expect(screen.getByRole('link', { name: 'Risks' })).toHaveAttribute('href', '/intelligence/risks');
    expect(screen.getByRole('link', { name: 'Rankings' })).toHaveAttribute('href', '/intelligence/rankings');
    // The non-navigable future-text rendering no longer applies to these three surfaces.
    expect(screen.queryByTestId('nav-future-Opportunities')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-future-Risks')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nav-future-Rankings')).not.toBeInTheDocument();
  });
'@
$t = Replace-Once $t $anchor12 $replacement12 "$rel :: future text"
Write-Utf8Lf $abs $t $rel

# --- MODIFY 6/6 : frontend/src/features/intelligence/IntelligenceHub.test.tsx
$rel = 'frontend/src/features/intelligence/IntelligenceHub.test.tsx'
$abs = Join-Path $root $rel
$t = Read-Utf8 $abs

$anchor13 = @'
import type { DecisionMatrixData } from '../../api/decisionMatrix';
'@
$replacement13 = @'
import type { DecisionMatrixData } from '../../api/decisionMatrix';
import type { CrossSectorData } from '../../api/crossSector';
'@
$t = Replace-Once $t $anchor13 $replacement13 "$rel :: import"

$anchor14 = @'
function urlAwareMock(payload: DecisionMatrixData = DIRECTORY, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/decision-matrix')) {
      if (opts.fails) return Promise.reject(new Error('directory down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}
'@
$replacement14 = @'
/**
 * NP-18: the implemented Intelligence framing views read the SAME certified cross-sector
 * payload, so the mock serves that existing guarded path alongside the directory path.
 */
const CROSS_SECTOR: CrossSectorData = {
  portfolio: { portfolioId: 'PF-1', scenario: 'Balanced', holdings: 3, avgConviction: 60, avgQuality: 57, avgRisk: 44, concentration: 61, diversificationScore: 90 },
  diversification: { band: 'Good', flags: ['sector spread adequate'] },
  ranking: [
    { companyId: 'Banking-H1', sector: 'Banking', conviction: 47 },
    { companyId: 'Technology-H1', sector: 'Technology', conviction: 76 },
    { companyId: 'Energy-H1', sector: 'Energy', conviction: 55 },
  ],
  opportunity: [
    { companyId: 'Technology-H1', sector: 'Technology', conviction: 76 },
    { companyId: 'Energy-H1', sector: 'Energy', conviction: 55 },
  ],
  correlation: { flags: ['pairwise correlation elevated'], concentrationSectors: ['Banking'] },
  decisions: [{ sector: 'Technology', verdict: 'Buy', composite: 76.3, confidence: 0.8 }],
  provenance: PROVENANCE,
};

function urlAwareMock(payload: DecisionMatrixData = DIRECTORY, opts: { fails?: boolean } = {}): ReturnType<typeof vi.fn> {
  return vi.fn((input: unknown) => {
    const url = String(input);
    if (url.includes('/api/decision-matrix')) {
      if (opts.fails) return Promise.reject(new Error('directory down')) as never;
      return Promise.resolve({ ok: true, json: async () => payload }) as never;
    }
    if (url.includes('/api/cross-sector')) {
      return Promise.resolve({ ok: true, json: async () => CROSS_SECTOR }) as never;
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) }) as never;
  });
}
'@
$t = Replace-Once $t $anchor14 $replacement14 "$rel :: mock"

$anchor15 = @'
  it('marks future intelligence surfaces honestly (text only, no fabricated links)', async () => {
    globalThis.fetch = urlAwareMock();
    renderHub();
    await screen.findByText('Banking');
    expect(screen.getByTestId('intelligence-future')).toHaveTextContent('Opportunities @@MIDDOT@@ Risks @@MIDDOT@@ Rankings');
    expect(screen.queryByRole('link', { name: /Opportunities/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Risks/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Rankings/ })).not.toBeInTheDocument();
  });
'@
$replacement15 = @'
  it('NP-18: exposes the three implemented intelligence views as genuine entry points', async () => {
    globalThis.fetch = urlAwareMock();
    renderHub();
    await screen.findByText('Banking');
    const views = screen.getByTestId('intelligence-views');
    expect(within(views).getByRole('link', { name: 'Opportunities' })).toHaveAttribute('href', '/intelligence/opportunities');
    expect(within(views).getByRole('link', { name: 'Risks' })).toHaveAttribute('href', '/intelligence/risks');
    expect(within(views).getByRole('link', { name: 'Rankings' })).toHaveAttribute('href', '/intelligence/rankings');
    // The obsolete future marker is gone: these are implemented surfaces, not promises.
    expect(screen.queryByTestId('intelligence-future')).not.toBeInTheDocument();
  });
'@
$t = Replace-Once $t $anchor15 $replacement15 "$rel :: future surfaces test"

$anchor16 = @'
  it('future intelligence children (/intelligence/opportunities) remain placeholders', async () => {
    globalThis.fetch = urlAwareMock();
    render(
      <MemoryRouter initialEntries={['/intelligence/opportunities']}>
        <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-A', role: 'analyst', authenticated: true }}>
          <App />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('shell-not-authorized')).toBeInTheDocument();
  });
'@
$replacement16 = @'
  it('NP-18: /intelligence/opportunities now renders the implemented view, not a placeholder', async () => {
    globalThis.fetch = urlAwareMock();
    render(
      <MemoryRouter initialEntries={['/intelligence/opportunities']}>
        <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-A', role: 'analyst', authenticated: true }}>
          <App />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Opportunities' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
  });

  it('NP-18: /intelligence/risks and /intelligence/rankings resolve to their implemented views', async () => {
    globalThis.fetch = urlAwareMock();
    const risks = render(
      <MemoryRouter initialEntries={['/intelligence/risks']}>
        <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-A', role: 'analyst', authenticated: true }}>
          <App />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Risks' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
    risks.unmount();

    render(
      <MemoryRouter initialEntries={['/intelligence/rankings']}>
        <SessionProvider session={{ userId: 'u1', tenantId: 'tenant-A', role: 'analyst', authenticated: true }}>
          <App />
        </SessionProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'Rankings' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-not-authorized')).not.toBeInTheDocument();
  });
'@
$t = Replace-Once $t $anchor16 $replacement16 "$rel :: placeholder route test"
Write-Utf8Lf $abs $t $rel

# ===========================================================================
Section '8. boundary verification after mutation'
# ===========================================================================
Assert-Boundary $root 'after mutation'
Assert-ForbiddenUnchanged $root

# ===========================================================================
Section '9. validation'
# ===========================================================================
Push-Location $Frontend
try {
    Note 'targeted NP-18 intelligence / navigation / sidebar tests'
    & npm run test -- src/features/intelligence src/app/navigation.test.ts src/app/Sidebar.test.tsx
    Assert-Exit $LASTEXITCODE 'npm run test (targeted NP-18)'

    Note 'typecheck (tsc --noEmit)'
    & npm run typecheck
    Assert-Exit $LASTEXITCODE 'npm run typecheck'

    Note 'server typecheck (tsc --noEmit -p tsconfig.server.json)'
    & npm run typecheck:server
    Assert-Exit $LASTEXITCODE 'npm run typecheck:server'

    Note 'full frontend test suite (vitest run)'
    Note '  reference result: 677 passed / 0 failed / 32 skipped'
    Note '  the 5 skipped server/live certification files are pre-existing intentional skips'
    & npm run test
    Assert-Exit $LASTEXITCODE 'npm run test (full suite)'

    Note 'production build (tsc -b && vite build)'
    & npm run build
    Assert-Exit $LASTEXITCODE 'npm run build'
}
finally {
    Pop-Location
}

# ===========================================================================
Section '10. boundary re-verification after validation (npm may not leave residue)'
# ===========================================================================
Assert-Boundary $root 'after validation'
Assert-ForbiddenUnchanged $root

$modifiedTracked = @(& git -C $root diff --name-only)
Note ('tracked files modified = ' + $modifiedTracked.Count)
$untrackedNow = @(& git -C $root ls-files --others --exclude-standard)
Note ('untracked new files    = ' + $untrackedNow.Count)

# ===========================================================================
Section '11. result'
# ===========================================================================
Write-Host ''
Write-Host '  CHANGED FILES     : 12  (6 modified + 6 new)'
Write-Host '  UNAUTHORIZED      : 0'
Write-Host '  FORBIDDEN FILES   : unchanged'
Write-Host '  TYPECHECK         : PASS (frontend + server)'
Write-Host '  TARGETED TESTS    : PASS'
Write-Host '  FULL TEST SUITE   : PASS (actual counts printed above)'
Write-Host '  BUILD             : PASS'
Write-Host '  WORKTREE          : 12 authorized changes, nothing else'
Write-Host ''
Write-Host '  NOTHING HAS BEEN COMMITTED AND NOTHING HAS BEEN PUSHED.'
Write-Host ''

NP-18 IMPLEMENTATION COMPLETE (NOT COMMITTED, NOT PUSHED)
