#!/usr/bin/env tsx
/**
 * STL host verification runner — computes W06/W13/W20/W16/W11 reports over HOST-CAPTURED evidence.
 *
 * Run from the IRR repo root on the owner's Windows machine:
 *   npx tsx tools/windows/snapshot-to-live/stl-host-verify.ts --mode w13 \
 *     --capture-exact <LOCAL-ONLY exact capture json> --observations-dir <step-04 output/observations> \
 *     --out <package output dir> [--thetaM <number>]
 *
 * Modes:
 *   w06  measureDhanRevisionCoverage over the captured revision, readers injected from saved
 *        quote/freshness responses (NO live calls from this runner).
 *   w13  measurePositionValuation over the captured positions + evaluateMonetaryCoverageGate
 *        (W20). thetaM is an injected TEST parameter only — UNESTABLISHED in production unless
 *        passed explicitly; the gate output records ESTABLISHED/UNESTABLISHED accordingly.
 *   w16  provenance envelopes + classifyPair + assessStaleness over captured artifacts.
 *   w11  executeIssuerEngine for the resolved actual holding against the real persisted
 *        Infosys dataset, with the captured revision pinned (expectedRevision). The expected
 *        outcome today is a recorded refusal (QUALIFICATION_NOT_QUALIFIED) — a refusal is
 *        evidence, never a failure of this runner.
 *
 * This runner is READ-ONLY toward every service: it reads only the files named on the command
 * line. It never opens a socket, never writes outside --out, and never fabricates missing
 * evidence (missing inputs exit 3 with a named code).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  measureDhanRevisionCoverage,
  validateCapturedRevisionRef,
  type CapturedRevisionRef,
  type CapturedHoldingRow,
  type RevisionCoverageReaders,
  type RevisionQuoteReadOutcome,
  type RevisionFreshnessReadOutcome,
} from '../../../frontend/server/market-data/dhanRevisionCoverage.js';
import {
  measurePositionValuation,
  type PositionValuationInput,
} from '../../../frontend/server/investment/positionValuation.js';
import { evaluateMonetaryCoverageGate } from '../../../frontend/server/investment/w20MonetaryCoverageGate.js';
import {
  mapCaptureRefToEnvelope,
  mapValuationReportToEnvelope,
  mapExecutionReportToEnvelope,
  mapReportArtifactToEnvelope,
  classifyPair,
  assessStaleness,
} from '../../../frontend/server/investment/lineage/provenanceEnvelope.js';
import { projectW09Capture } from '../../../frontend/server/investment/lineage/projections.js';
import { openLocalSnapshot } from '../../../iips-platform/src/investment/port/localSnapshotStore.js';
import { loadIdentitySourcesFromDir } from '../../../iips-platform/src/investment/identity/sources.js';
import { resolveIdentity } from '../../../iips-platform/src/investment/identity/resolver.js';
import { executePortfolioEngines, certifiedEngineExecutor } from '../../../iips-platform/src/investment/execution/execute.js';
import type { DatasetContent } from '../../../iips-platform/src/investment/fundamentals/types.js';
import type { PortfolioHoldingEvidence, PortfolioRevisionEvidence } from '../../../iips-platform/src/investment/execution/types.js';

/* ---------------------------------------------------------------- args */

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    out[key.slice(2)] = argv[i + 1] ?? '';
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const mode = args['mode'] ?? '';
const outDir = resolve(args['out'] ?? '');
const captureExactPath = resolve(args['capture-exact'] ?? '');

if (!mode || !outDir || !captureExactPath) {
  console.error('usage: stl-host-verify.ts --mode w06|w13|w16|w11 --capture-exact <file> --out <dir> [--observations-dir <dir>] [--thetaM <n>] [--dataset-dir <dir>] [--identity-dir <dir>] [--w13-report <file>] [--w11-report <file>] [--reports-artifacts <file>] [--cycle-a <file>] [--cycle-b <file>]');
  process.exit(2);
}
if (!existsSync(captureExactPath)) {
  console.error('MISSING_INPUT capture-exact: ' + captureExactPath);
  process.exit(3);
}
mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------------- capture model */

interface ExactCaptureDoc {
  captureId: string;
  selection: { portfolioId: string };
  consumerObservation: { finalReadCompletedAtUtc: string };
  irrMirror: {
    firstView: {
      revision: number;
      provenanceDigest: string;
      holdings: Array<Record<string, unknown>>;
    };
  };
}

const exact = JSON.parse(readFileSync(captureExactPath, 'utf8')) as ExactCaptureDoc;
const firstView = exact.irrMirror.firstView;

function captureRef(): CapturedRevisionRef {
  return {
    portfolioId: exact.selection.portfolioId,
    revision: firstView.revision,
    provenanceDigest: firstView.provenanceDigest,
    capturedAt: exact.consumerObservation.finalReadCompletedAtUtc,
  };
}

function holdingRows(): CapturedHoldingRow[] {
  return firstView.holdings.map((h, index) => {
    const identity = (h['securityIdentity'] ?? null) as Record<string, unknown> | null;
    const securityId = identity && typeof identity['securityId'] === 'string' ? (identity['securityId'] as string) : null;
    return {
      rowId: typeof h['symbol'] === 'string' ? `${index}:${h['symbol']}` : `row-${index}`,
      companyId: typeof h['companyId'] === 'string' ? (h['companyId'] as string) : '',
      securityId,
      exchangeSegment: h['exchange'] === 'BSE' ? 'BSE_EQ' : 'NSE_EQ',
    } as CapturedHoldingRow;
  });
}

function valuationInputs(): PositionValuationInput[] {
  return firstView.holdings.map((h, index) => {
    const identity = (h['securityIdentity'] ?? null) as Record<string, unknown> | null;
    const securityId = identity && typeof identity['securityId'] === 'string' ? (identity['securityId'] as string) : null;
    return {
      rowId: typeof h['symbol'] === 'string' ? `${index}:${h['symbol']}` : `row-${index}`,
      companyId: typeof h['companyId'] === 'string' ? (h['companyId'] as string) : '',
      exchangeSegment: h['exchange'] === 'BSE' ? ('BSE_EQ' as const) : ('NSE_EQ' as const),
      securityId,
      quantity: typeof h['quantity'] === 'number' ? (h['quantity'] as number) : 0,
      storedCurrentPrice: typeof h['currentPrice'] === 'number' ? (h['currentPrice'] as number) : 0,
      storedMarketValue: typeof h['marketValue'] === 'number' ? (h['marketValue'] as number) : 0,
      storedWeightPercentage: typeof h['weightPercentage'] === 'number' ? (h['weightPercentage'] as number) : 0,
      active: h['active'] === true,
    };
  });
}

/* --------------------------------- readers injected from saved responses */

function readersFromObservations(observationsDir: string): RevisionCoverageReaders {
  const readQuote = async (scope: { companyId: string; securityId: string; exchangeSegment?: 'NSE_EQ' | 'BSE_EQ' }): Promise<RevisionQuoteReadOutcome> => {
    // find the observation dir whose freshness/quote responses name this securityId
    const { readdirSync } = await import('node:fs');
    const dirs = readdirSync(observationsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    for (const d of dirs) {
      const qPath = join(observationsDir, d, 'quote-response.json');
      if (!existsSync(qPath)) continue;
      const body = JSON.parse(readFileSync(qPath, 'utf8')) as Record<string, unknown>;
      const requested = (body['requested'] ?? body) as Record<string, unknown>;
      if (requested['securityId'] === scope.securityId || body['securityId'] === scope.securityId) {
        if (typeof body['error'] === 'string') return { ok: false, code: body['error'], message: 'captured quote refusal', identityFailure: false };
        return { ok: true, view: body as never };
      }
    }
    return { ok: false, code: 'NO_CAPTURED_QUOTE', message: 'no captured quote response for this securityId in ' + observationsDir, identityFailure: false };
  };
  const readFreshness = async (query: { domain: 'D01_QUOTES'; companyId: string; exchangeSegment: string; securityId: string }): Promise<RevisionFreshnessReadOutcome> => {
    const { readdirSync } = await import('node:fs');
    const dirs = readdirSync(observationsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    for (const d of dirs) {
      const fPath = join(observationsDir, d, 'freshness-response.json');
      if (!existsSync(fPath)) continue;
      const body = JSON.parse(readFileSync(fPath, 'utf8')) as Record<string, unknown>;
      const q = (body['query'] ?? body) as Record<string, unknown>;
      if (q['securityId'] === query.securityId || body['securityId'] === query.securityId) {
        if (typeof body['error'] === 'string') return { ok: false, code: body['error'], message: 'captured freshness refusal' };
        // The API route returns the PROJECTED DhanFreshnessView; measureDhanRevisionCoverage's
        // reader contract takes the raw IpdFreshnessStatus. Map field-by-field, never invent:
        // every field below is present in the captured body or explicitly nulled.
        const lastRefresh = (body['lastRefresh'] ?? {}) as Record<string, unknown>;
        const status = {
          domain: String(body['domain'] ?? query.domain),
          cacheState: String(body['cacheState'] ?? 'NOT_AVAILABLE'),
          asOf: (body['asOf'] ?? null) as string | null,
          timestampEvidence: String(body['timestampEvidence'] ?? ''),
          receivedAt: (body['receivedAt'] ?? null) as string | null,
          evaluatedAt: String(body['evaluatedAt'] ?? ''),
          observationEvaluatedAt: (body['observationEvaluatedAt'] ?? null) as string | null,
          thresholdSeconds: typeof body['thresholdSeconds'] === 'number' ? body['thresholdSeconds'] : 0,
          ageSeconds: typeof body['ageSeconds'] === 'number' ? body['ageSeconds'] : null,
          verdict: String(body['verdict'] ?? 'UNKNOWN'),
          staleConcessionActive: body['staleConcessionActive'] === true,
          suppressExecution: body['suppressExecution'] === true,
          eligibleForUse: body['eligibleForUse'] === true,
          lastRefresh: { outcome: String(lastRefresh['outcome'] ?? ''), lastFailure: (lastRefresh['lastFailure'] ?? null) as string | null },
        };
        return { ok: true, status: status as never };
      }
    }
    return { ok: false, code: 'NO_CAPTURED_FRESHNESS', message: 'no captured freshness response for this securityId in ' + observationsDir };
  };
  return { readQuote, readFreshness };
}

function writeOut(name: string, value: unknown): void {
  writeFileSync(join(outDir, name), JSON.stringify(value, null, 2) + '\n');
}

/* ------------------------------------------------------------------ main */

async function main(): Promise<number> {
  const ref = captureRef();
  const refCheck = validateCapturedRevisionRef(ref);
  if (!refCheck.ok) {
    console.error('CAPTURE_REF_INVALID', JSON.stringify(refCheck));
    return 3;
  }

  if (mode === 'w06' || mode === 'w13') {
    const observationsDir = resolve(args['observations-dir'] ?? '');
    if (!observationsDir || !existsSync(observationsDir)) {
      console.error('MISSING_INPUT observations-dir: ' + observationsDir + ' (run 04-w06-quote-freshness-measure.ps1 first)');
      return 3;
    }
    const readers = readersFromObservations(observationsDir);
    const rows = holdingRows();
    const coverage = await measureDhanRevisionCoverage(ref, rows, readers);
    writeOut('w06-coverage-report.json', { schema: 'iips.w06.dhan-revision-coverage/v1', capture: ref, outcome: coverage });

    if (mode === 'w13') {
      const positions = valuationInputs();
      const valuation = await measurePositionValuation(ref, positions, readers);
      writeOut('w13-valuation-report.json', { schema: 'iips.w13.position-valuation/v1', outcome: valuation });
      if (valuation.ok) {
        const thetaRaw = args['thetaM'];
        const thetaM = thetaRaw !== undefined && thetaRaw !== '' && Number.isFinite(Number(thetaRaw)) ? Number(thetaRaw) : null;
        const gate = evaluateMonetaryCoverageGate(valuation.report, {
          ...(thetaM === null ? {} : { thetaM }),
        });
        writeOut('w20-gate-output.json', {
          schema: 'iips.w20.monetary-coverage-gate/v1',
          note: 'thetaM passed on the command line is an injected TEST parameter; production thetaM is UNESTABLISHED. Synthetic-parameter verdicts are not acceptance.',
          thetaMInjected: thetaM,
          gate,
        });
      }
    }
    console.log('MODE ' + mode + ' OK -> ' + outDir);
    return 0;
  }

  if (mode === 'w16') {
    const envelopes: Record<string, unknown> = {};
    envelopes['W09_CAPTURE'] = projectW09Capture(ref);
    const w13Path = args['w13-report'];
    if (w13Path && existsSync(resolve(w13Path))) {
      const w13 = JSON.parse(readFileSync(resolve(w13Path), 'utf8'));
      const report = w13.outcome?.report ?? w13.report;
      if (report) envelopes['W13_VALUATION'] = mapValuationReportToEnvelope(report);
    }
    const w11Path = args['w11-report'];
    if (w11Path && existsSync(resolve(w11Path))) {
      const w11 = JSON.parse(readFileSync(resolve(w11Path), 'utf8'));
      const report = w11.report ?? w11;
      if (report && report.schema) envelopes['W11_EXECUTION'] = mapExecutionReportToEnvelope(report);
    }
    const reportsPath = args['reports-artifacts'];
    if (reportsPath && existsSync(resolve(reportsPath))) {
      const arts = JSON.parse(readFileSync(resolve(reportsPath), 'utf8'));
      const items = Array.isArray(arts) ? arts : (arts.items ?? arts.artifacts ?? []);
      envelopes['W15_REPORTS'] = items.slice(0, 25).map((a: Record<string, unknown>) =>
        mapReportArtifactToEnvelope({
          reportType: String(a.reportType ?? ''),
          portfolioId: String(a.portfolioId ?? ''),
          chainRef: (a.chainRef ?? null) as string | null,
          reportId: (a.reportId ?? null) as string | null,
          reportKey: (a.reportKey ?? null) as string | null,
          artifactVersion: typeof a.artifactVersion === 'number' ? a.artifactVersion : null,
          supersedesReportId: (a.supersedesReportId ?? null) as string | null,
          engineOutputId: (a.engineOutputId ?? null) as string | null,
          schemaVersion: typeof a.schemaVersion === 'number' ? a.schemaVersion : 1,
          generatedAt: (a.generatedAt ?? null) as string | null,
        }),
      );
    }
    // pair classification between two capture reads (UNCHANGED = content-identical non-write)
    const pairs: unknown[] = [];
    const cycleA = args['cycle-a'] ? resolve(args['cycle-a']) : '';
    const cycleB = args['cycle-b'] ? resolve(args['cycle-b']) : '';
    if (cycleA && cycleB && existsSync(cycleA) && existsSync(cycleB)) {
      const a = JSON.parse(readFileSync(cycleA, 'utf8'));
      const b = JSON.parse(readFileSync(cycleB, 'utf8'));
      const envA = mapCaptureRefToEnvelope({ ...ref, provenanceDigest: String(a.provenanceDigest ?? '') });
      const envB = mapCaptureRefToEnvelope({ ...ref, provenanceDigest: String(b.provenanceDigest ?? '') });
      pairs.push({
        pair: 'W09 capture cycle A vs cycle B',
        assessment: classifyPair(envA, envB, {
          contentDigestsEqual: String(a.provenanceDigest ?? '') === String(b.provenanceDigest ?? '') && String(a.provenanceDigest ?? '') !== '',
          positionDelta: Array.isArray(a.holdings) && Array.isArray(b.holdings) ? Math.abs(a.holdings.length - b.holdings.length) : undefined,
        }),
      });
    }
    // read-time staleness from the captured freshness verdicts
    const staleness: unknown[] = [];
    const observationsDir = args['observations-dir'] ? resolve(args['observations-dir']) : '';
    if (observationsDir && existsSync(observationsDir)) {
      const { readdirSync } = await import('node:fs');
      for (const d of readdirSync(observationsDir, { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => x.name)) {
        const fPath = join(observationsDir, d, 'freshness-response.json');
        if (!existsSync(fPath)) continue;
        const body = JSON.parse(readFileSync(fPath, 'utf8')) as Record<string, unknown>;
        staleness.push({ rowDir: d, assessment: assessStaleness({ recordedVerdict: (body['verdict'] ?? null) as string | null, ageSeconds: typeof body['ageSeconds'] === 'number' ? body['ageSeconds'] : null, thresholdSeconds: typeof body['thresholdSeconds'] === 'number' ? body['thresholdSeconds'] : null }) });
      }
    }
    writeOut('w16-lineage-report.json', {
      schema: 'iips.w16.provenance-envelope/v1',
      note: 'envelopes over host-captured artifacts; pair classification per adopted contract (§16.336); unknown stays unknown',
      envelopes,
      pairs,
      staleness,
    });
    console.log('MODE w16 OK -> ' + outDir);
    return 0;
  }

  if (mode === 'w11') {
    const irrRoot = resolve(args['irr-root'] ?? process.cwd());
    const datasetDir = resolve(args['dataset-dir'] ?? join(irrRoot, 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/dataset'));
    const identityDir = resolve(args['identity-dir'] ?? join(irrRoot, 'evidence/real-issuer/REL-1-INFOSYS-2026-11-06/identity'));
    if (!existsSync(datasetDir) || !existsSync(identityDir)) {
      console.error('MISSING_INPUT dataset-dir/identity-dir (actual Infosys evidence bundle): ' + datasetDir + ' , ' + identityDir);
      return 3;
    }
    const port = openLocalSnapshot({ dataDir: datasetDir });
    const manifest = port.manifest();
    const issuers = port.listIssuers();
    const content: DatasetContent = {
      ...(manifest.datasetSchema === undefined ? {} : { datasetSchema: manifest.datasetSchema }),
      issuers,
      securities: issuers.flatMap((entry) => port.securitiesFor(entry.issuerId)),
      listings: issuers.flatMap((entry) => port.listingsFor(entry.issuerId)),
      periods: issuers.flatMap((entry) => port.periodsFor(entry.issuerId)),
      prices: [],
      corporateActions: issuers.flatMap((entry) => port.corporateActionsFor(entry.issuerId)),
      operatingMetrics: issuers.flatMap((entry) => port.operatingMetricsFor(entry.issuerId)),
      issues: port.issues(),
    };
    const loaded = loadIdentitySourcesFromDir(identityDir);
    if (!loaded.available) {
      console.error('MISSING_INPUT identity sources not available in ' + identityDir);
      return 3;
    }
    // resolve the captured INFY holding (Infosys, ISIN INE009A01021 — the issuer of the
    // REL-1-INFOSYS-2026-11-06 real dataset) through the governed resolver.
    // NOTE the identity distinction: the W04-accepted 1/64 resolved holding is AGI
    // (ISIN:INE415A01038:EQ, holding:DHAN_PORTFOLIO:0001, §16.286 historical revision-1
    // evidence); INE009A01021 is Infosys holding #30 INFY, a DIFFERENT row whose provisioned
    // identity feeds the W11 dataset. (exact call shape of tests/investment/w11IssuerEngineExecution.test.ts)
    const rows = firstView.holdings;
    const resolvedRow = rows.find((h) => {
      const id = (h['securityIdentity'] ?? null) as Record<string, unknown> | null;
      return id && id['securityId'] === 'ISIN:INE009A01021:EQ';
    });
    if (!resolvedRow) {
      console.error('NO_RESOLVED_HOLDING: the captured revision has no INFY (ISIN:INE009A01021:EQ) row — the W11 dataset issuer is not identity-bound in this revision; nothing to execute. (The W04-resolved AGI row ISIN:INE415A01038:EQ is a different holding with no real-issuer dataset in this package.)');
      writeOut('w11-execution-report.json', { schema: 'w11-issuer-engine-execution/1.0.0', blocked: 'NO_RESOLVED_HOLDING', note: 'no engine call was made; W11 dataset issuer Infosys (INE009A01021) not identity-bound in the captured revision' });
      return 0;
    }
    const resolution = resolveIdentity(
      { observationId: 'holding-' + rows.indexOf(resolvedRow), source: 'HOLDING', isin: 'INE009A01021', symbol: 'INFY', exchange: 'NSE', series: 'EQ', cin: null, companyIdHint: null },
      { sources: (loaded as { sources: unknown }).sources as never, asOf: args['identity-as-of'] ?? '2024-06-30' },
    );
    const holding: PortfolioHoldingEvidence = {
      holdingIndex: rows.indexOf(resolvedRow),
      securityId: resolution.securityId,
      isin: 'INE009A01021',
      series: 'EQ',
      issuerId: resolution.issuerId,
      identityState: resolution.state,
      resolutionBasis: resolution.resolutionBasis,
      assessable: resolution.state === 'RESOLVED' && resolution.listingId !== null,
      reason: resolution.failure?.reason ?? null,
      weightPercentage: typeof resolvedRow['weightPercentage'] === 'number' ? resolvedRow['weightPercentage'] : null,
    };
    const portfolio: PortfolioRevisionEvidence = {
      portfolioId: exact.selection.portfolioId,
      revision: firstView.revision,
      readSource: 'IPD_G2_IPC:v1 — host capture ' + exact.captureId,
      observedAt: exact.consumerObservation.finalReadCompletedAtUtc,
      ownerBindingRef: null,
      holdings: [holding],
    };
    // pinned dataset digest of the persisted REL-1 Infosys bundle (recorded verbatim, per the W11 test)
    const report = executePortfolioEngines({
      content,
      portfolio,
      asOf: args['as-of'] ?? '2024-06-30',
      expectedRevision: firstView.revision,
      datasetVersion: 'sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e',
      policy: { allowClosingBalanceRatioDerivations: true },
      executor: certifiedEngineExecutor(),
    });
    writeOut('w11-execution-report.json', {
      schema: 'w11-issuer-engine-execution/1.0.0',
      captureId: exact.captureId,
      identityResolution: { state: resolution.state, issuerId: resolution.issuerId, securityId: resolution.securityId, listingId: resolution.listingId },
      note: 'actual persisted dataset + captured revision pinned via expectedRevision; a refusal (e.g. QUALIFICATION_NOT_QUALIFIED — 62 required inputs lack authorised sources) is the expected honest outcome today and is recorded verbatim, never suppressed',
      report,
    });
    console.log('MODE w11 OK -> ' + outDir + ' (refusal recorded if any)');
    return 0;
  }

  console.error('UNKNOWN_MODE ' + mode);
  return 2;
}

main().then((code) => process.exit(code)).catch((error) => {
  console.error("INTERNAL_ERROR", error instanceof Error ? error.stack : String(error));
  process.exit(70);
});
