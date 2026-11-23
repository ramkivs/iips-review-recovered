#!/usr/bin/env tsx
/**
 * W-28 — Measure Mapping Coverage Against Actual Persisted Holdings (CLI).
 *
 * Usage:
 *   npm run w28:measure -- --manifest <path-to-qualification-manifest.json> [--portfolioId <id>] [--ownerOutput <path>] [--publicOutput <path>]
 *
 * Holdings are read via the existing W11-Dep1 capture path (read-only, bounded,
 * consistent). Registry snapshot is the IPD-immutable manifest (SHA-validated).
 * Per-holding results use ONLY persisted exact identity (ISIN+exchange+series).
 *
 * Privacy:
 *   --ownerOutput (default: $IIPS_W28_OWNER_LOCAL_OUTPUT or /tmp/iips-w28-owner-local-<ts>.json)
 *     Contains raw ISINs. Stays on the operator's host, never committed/uploaded.
 *   --publicOutput (default: ./evidence/w28-coverage-summary.json)
 *     Sanitized aggregates only (masked ISINs, counts). Safe to commit.
 *
 * Exit codes:
 *   0  coverage measured (even if 0% — that's data, not failure)
 *   2  configuration invalid (no IPC endpoint / binding not affirmed)
 *   10 IPC connection failure
 *   11 binding/authorization refusal
 *   12 ambiguous/missing portfolio
 *   13 inconsistent read (all attempts inconsistent)
 *   14 protocol/capability unavailable
 *   15 output write failure
 *   70 internal error
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

import { captureOwnerBoundPortfolio, CAPTURE_EXIT_CODES, buildExactCaptureDocument, buildSanitizedSummary, sha256Hex } from '../user-portfolio/capture/ownerBoundPortfolioCapture';
import { loadRegistrySnapshotFromFile } from './registrySnapshot';
import { measureCoverage, buildHoldingsSnapshotRef, sanitizeForPublication, maskIsin } from './coverageMeasurement';
import type { G2PortfolioView } from '../user-portfolio/userPortfolioContract';

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { out[key] = next; i++; } else out[key] = true;
    }
  }
  return out;
}

function printHelp(): void {
  console.log(`
W-28 — Measure Mapping Coverage Against Actual Persisted Holdings

Usage:
  npx tsx frontend/server/w28/measureCoverageCli.ts --manifest <path> [options]

Options:
  --manifest <path>      Path to the downloaded qualification-manifest.json
                         (exact artifact 371bf3bd..., SHA 69a918f7...). Required.
  --portfolioId <id>     When multiple portfolios are listed, select this one.
  --ownerOutput <path>   Owner-local detailed report (raw ISINs). Default:
                         $IIPS_W28_OWNER_LOCAL_OUTPUT or /tmp/iips-w28-owner-local-<ts>.json
  --publicOutput <path>  Publishable sanitized summary (no raw ISINs). Default:
                         evidence/w28-coverage-summary.json (relative to repo root)
  --help                 Show this help.

Prerequisites (same as W11-Dep1 capture):
  - Windows host with IPD IPC service already running.
  - IIPS_G2_IPC_ENDPOINT and IIPS_G3_IPC_BINDING_PROVISIONED in the server-owned env.
  - The manifest downloaded read-only from GitHub contents API at the exact commit.

Privacy:
  The owner-local output contains real ISINs and must stay on the operator host.
  Only the sanitized summary is publishable.
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); process.exit(0); }

  const manifestPath = args.manifest as string | undefined;
  if (!manifestPath) {
    console.error('ERROR: --manifest <path> is required. The manifest must be the exact immutable artifact 371bf3bd... downloaded read-only from GitHub.');
    console.error('Run with --help for usage.');
    process.exit(2);
  }

  const ownerOutput = (args.ownerOutput as string | undefined) ?? process.env.IIPS_W28_OWNER_LOCAL_OUTPUT ?? `/tmp/iips-w28-owner-local-${Date.now()}.json`;
  const publicOutput = (args.publicOutput as string | undefined) ?? resolve(process.cwd(), 'evidence/w28-coverage-summary.json');
  const operatorPortfolioId = args.portfolioId as string | undefined;

  // 1. Load and validate registry snapshot
  let registry: ReturnType<typeof loadRegistrySnapshotFromFile>;
  try {
    registry = loadRegistrySnapshotFromFile(manifestPath);
    console.log(`Registry snapshot: ${registry.registryVersion} (${registry.qualifiedCount} qualified, manifest ${registry.manifestCommit.slice(0, 7)}, pipeline ${registry.pipelineCommit.slice(0, 7)}, SHA ${registry.manifestSha256.slice(0, 12)}…)`);
    if (registry.counts && typeof registry.counts.qualified === 'number') {
      console.log(`Manifest counts: qualified=${registry.counts.qualified}, non_equity=${registry.counts.non_equity ?? 'n/a'}, no_p04=${registry.counts.no_p04 ?? 'n/a'}, invalid=${registry.counts.invalid ?? 'n/a'}`);
    }
  } catch (e) {
    console.error(`ERROR loading registry snapshot from ${manifestPath}: ${(e as Error).message}`);
    process.exit(2);
  }

  // 2. Capture actual persisted holdings (read-only, bounded, consistent)
  console.log('Capturing persisted holdings via IpcUserPortfolioPort (read-only, bounded, consistent)…');
  const captureResult = await captureOwnerBoundPortfolio({
    env: process.env,
    portfolioId: operatorPortfolioId,
    maxAttempts: 3,
  });

  if (captureResult.outcome !== 'CONSISTENT_CAPTURE' || !captureResult.accepted) {
    console.error(`Capture ${captureResult.outcome}: ${captureResult.message}`);
    console.error(`Exit ${captureResult.exitCode}. No measurement can be produced without a consistent holdings snapshot.`);
    // Still write a blocker summary for evidence of attempt
    const exactRef = { written: false, fileName: null as string | null, sha256: null as string | null, bytes: null as number | null };
    const summary = buildSanitizedSummary(captureResult, {}, exactRef);
    const blocker = {
      schema: 'iips.w28.coverage-blocked/v1',
      at: new Date().toISOString(),
      registrySnapshot: { manifestCommit: registry.manifestCommit, pipelineCommit: registry.pipelineCommit, manifestSha256: registry.manifestSha256, qualifiedCount: registry.qualifiedCount, registryVersion: registry.registryVersion },
      holdingsSource: { attempted: true, outcome: captureResult.outcome, reasonCode: captureResult.reasonCode, exitCode: captureResult.exitCode, configurationProblems: captureResult.configuration.problems },
      measurement: null,
      note: 'Holdings snapshot unavailable in this environment. Re-run on an authorized Windows host with IPD running and binding provisioned. See docs/integration/DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md.',
    };
    try {
      mkdirSync(dirname(publicOutput), { recursive: true });
      writeFileSync(publicOutput, JSON.stringify({ captureSummary: summary, blocker }, null, 2), 'utf8');
      console.error(`Wrote blocker summary to ${publicOutput}`);
    } catch (e) { console.error(`Failed to write blocker summary: ${(e as Error).message}`); }
    process.exit(captureResult.exitCode);
  }

  const accepted = captureResult.accepted;
  const holdingsSnapshotRef = buildHoldingsSnapshotRef([accepted.firstView], accepted.completedAtUtc);
  console.log(`Holdings snapshot: portfolio ${accepted.identifiedPortfolioId} revision ${accepted.firstView.revision} provenance ${accepted.firstView.provenanceDigest.slice(0, 12)}… holdings=${accepted.firstView.holdings.length} listed=${accepted.listedPortfolioCount}`);

  // Capture all portfolios if needed: re-run capture for each listed portfolio when there are multiple.
  // For W-28 the requirement is to measure against ALL actual persisted holdings. If multiple portfolios
  // are listed, the operator must select or we iterate. For now, if listedPortfolioCount > 1 and no
  // portfolioId was supplied, the capture already failed above with AMBIGUOUS_OR_MISSING_PORTFOLIO.
  // If there is exactly one, we have all holdings. If the operator wants all, they can run with each id.
  const portfolioViews: G2PortfolioView[] = [accepted.firstView];
  const totalHoldings = portfolioViews.reduce((s, p) => s + p.holdings.length, 0);
  holdingsSnapshotRef.portfolioIds.forEach(() => {});

  // 3. Measure coverage
  const allHoldings = portfolioViews.flatMap((pv) => pv.holdings);
  const portfolioMap = new Map(portfolioViews.map((pv) => [pv.portfolioId, pv]));
  const { results, summary, gaps } = measureCoverage(allHoldings, portfolioMap, registry);

  console.log(`Coverage: ${summary.holdingsWithQualifiedMappings}/${summary.totalHoldings} qualified (${summary.coveragePercentage}%), ${summary.holdingsWithProposedOnly} proposed, ${summary.unresolvedHoldings} unresolved`);
  if (gaps.gaps.length > 0) {
    console.log('Top gaps:');
    for (const g of gaps.gaps.slice(0, 5)) console.log(`  ${g.reason}: ${g.count} (${g.percentage}%) — ${g.description}`);
  }

  // 4. Write owner-local detailed report (raw ISINs) — never commit
  const exactCaptureDoc = buildExactCaptureDocument(captureResult, {});
  const exactBytes = JSON.stringify(exactCaptureDoc, null, 2);
  const exactSha = sha256Hex(exactBytes);

  const ownerLocalDoc = {
    schema: 'iips.w28.coverage-detailed-owner-local/v1',
    classification: 'LOCAL-ONLY — CONTAINS RAW ISINs — DO NOT PUBLISH, COMMIT OR UPLOAD',
    at: new Date().toISOString(),
    registrySnapshot: { manifestCommit: registry.manifestCommit, pipelineCommit: registry.pipelineCommit, manifestSha256: registry.manifestSha256, qualifiedCount: registry.qualifiedCount, counts: registry.counts, registryVersion: registry.registryVersion },
    holdingsSnapshotRef: { ...holdingsSnapshotRef, totalHoldings, capturedAt: accepted.completedAtUtc },
    capture: { outcome: captureResult.outcome, captureId: captureResult.captureId, attempts: captureResult.attempts.length, acceptedRevision: accepted.firstView.revision, provenanceDigest: accepted.firstView.provenanceDigest },
    results, // raw ISINs
    summary,
    gaps,
  };
  const ownerLocalBytes = JSON.stringify(ownerLocalDoc, null, 2);
  const ownerLocalSha = createHash('sha256').update(ownerLocalBytes).digest('hex');
  try {
    mkdirSync(dirname(resolve(ownerOutput)), { recursive: true });
    writeFileSync(resolve(ownerOutput), ownerLocalBytes, 'utf8');
    console.log(`Owner-local detailed report: ${resolve(ownerOutput)} (SHA ${ownerLocalSha.slice(0, 12)}…, ${Buffer.byteLength(ownerLocalBytes)} bytes) — DO NOT COMMIT`);
  } catch (e) {
    console.error(`ERROR writing owner-local report to ${ownerOutput}: ${(e as Error).message}`);
    process.exit(15);
  }

  // 5. Write publishable sanitized summary (no raw ISINs)
  const sanitizedResults = sanitizeForPublication(results);
  const captureSanitizedSummary = buildSanitizedSummary(captureResult, {}, { written: true, fileName: null, sha256: exactSha, bytes: Buffer.byteLength(exactBytes) });
  const publicDoc = {
    schema: 'iips.w28.coverage-summary-public/v1',
    at: new Date().toISOString(),
    registrySnapshot: { manifestCommit: registry.manifestCommit, pipelineCommit: registry.pipelineCommit, manifestSha256: registry.manifestSha256, qualifiedCount: registry.qualifiedCount, registryVersion: registry.registryVersion },
    holdingsSnapshotRef: { portfolioIds: holdingsSnapshotRef.portfolioIds, revisions: holdingsSnapshotRef.revisions, totalHoldings, capturedAt: accepted.completedAtUtc, provenanceDigests: holdingsSnapshotRef.provenanceDigests },
    captureSummary: captureSanitizedSummary,
    // Holdings and registry linkage
    holdingsSource: { outcome: captureResult.outcome, listedPortfolioCount: captureResult.listedPortfolioCount, attempts: captureResult.attempts.length },
    results: sanitizedResults, // masked ISINs only, isin=null
    summary,
    gaps,
    privacy: { rawIsinsPublished: false, ownerLocalSha256: ownerLocalSha, ownerLocalLocation: 'LOCAL_ONLY_NOT_PUBLISHED', note: 'Per-holding results here have isin=null and maskedIsin for publication; raw ISINs are only in the owner-local report on the capturing host.' },
    limitations: [
      'Manifest retains only 4680 qualified + 500 sampled non-equity; 19,060 no-P04 rows not individually retained — NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED used when p04/provider universes absent.',
      'Measurement is exact ISIN+exchange+series only; no name/symbol/fuzzy/company-level matching; ambiguous stays unresolved; proposed never counts as qualified.',
      'Holdings snapshot is read-only via IpcUserPortfolioPort (list/get/revisions/get) with bounded consistency checks; not atomicity.',
    ],
  };
  const publicBytes = JSON.stringify(publicDoc, null, 2);
  const publicSha = createHash('sha256').update(publicBytes).digest('hex');
  try {
    mkdirSync(dirname(resolve(publicOutput)), { recursive: true });
    writeFileSync(resolve(publicOutput), publicBytes, 'utf8');
    console.log(`Publishable summary: ${resolve(publicOutput)} (SHA ${publicSha.slice(0, 12)}…, ${Buffer.byteLength(publicBytes)} bytes)`);
  } catch (e) {
    console.error(`ERROR writing public summary to ${publicOutput}: ${(e as Error).message}`);
    process.exit(15);
  }

  console.log(`Done. Coverage ${summary.coveragePercentage}% qualified. Owner-local SHA ${ownerLocalSha.slice(0, 16)}…, public SHA ${publicSha.slice(0, 16)}….`);
  process.exit(0);
}

main().catch((e) => { console.error(`Internal error: ${(e as Error).message}\n${(e as Error).stack}`); process.exit(70); });
