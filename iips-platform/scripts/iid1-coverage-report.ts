/**
 * IID-1 evidence emitter.
 *
 * Renders the identity coverage report — and the HTML view the frontend serves — from the versioned
 * identity fixtures, so the evidence in `evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/` is produced by
 * the same code path the application uses, not by a parallel re-implementation.
 *
 *   tsx scripts/iid1-coverage-report.ts <output-dir> [asOf]
 *
 * Writes: coverage-report.json, coverage-view.html, coverage-summary.txt. Read-only: no dataset, no store
 * and no NP-04 artefact is touched.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { bindCoverageToHttp, type CoverageDependencies } from '../src/investment/identity/coverageEndpoint';
import { buildFinancialCoverageDisclosure } from '../src/investment/identity/coverage';
import {
  FIXTURE_AS_OF,
  fixtureObservations,
  identitySourceTexts,
  loadFixtureSourcesResult,
} from '../tests/investment/identityFixture';

const [outputDir = 'evidence', asOf = FIXTURE_AS_OF] = process.argv.slice(2);

const dependencies: CoverageDependencies = {
  loadSources: () => loadFixtureSourcesResult(),
  observations: async () => fixtureObservations(),
  // IID-1 evidence is rendered without a served dataset, so financial coverage is disclosed as NONE.
  financialCoverage: () => buildFinancialCoverageDisclosure({}),
  today: () => asOf,
};

const capture = async (): Promise<{ status: number; body: string; headers: Record<string, string> }> => {
  let status = 0;
  let body = '';
  let headers: Record<string, string> = {};
  const request = { method: 'GET', url: `/api/investment/coverage?asOf=${asOf}` } as never;
  const response = {
    writeHead(nextStatus: number, nextHeaders: Record<string, string>) {
      status = nextStatus;
      headers = nextHeaders;
      return response;
    },
    end(chunk?: string) {
      body = chunk ?? '';
      return response;
    },
  } as never;
  await bindCoverageToHttp(request, response, dependencies);
  if (status !== 200) throw new Error(`coverage request failed with ${status}: ${body.slice(0, 400)}`);
  return { status, body, headers };
};

async function main(): Promise<void> {
  const json = await capture();
  const htmlCapture = await (async () => {
    let body = '';
    const request = { method: 'GET', url: `/investment/coverage?asOf=${asOf}` } as never;
    const response = { writeHead: () => response, end: (chunk?: string) => ((body = chunk ?? ''), response) } as never;
    await bindCoverageToHttp(request, response, dependencies);
    return body;
  })();

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'coverage-report.json'), `${JSON.stringify(JSON.parse(json.body), null, 2)}\n`);
  writeFileSync(join(outputDir, 'coverage-view.html'), htmlCapture);

  const report = JSON.parse(json.body) as {
    asOf: string;
    counts: Record<string, number>;
    bySource: Record<string, { observed: number; resolved: number; unresolved: number; assessable: number }>;
    items: { observationId: string; source: string; state: string; reason: string | null }[];
    successorReconciliations: { actionId: string; measuredWeight: number; unmeasuredWeight: number; reconciles: boolean }[];
    statusLine: string;
    identitySources: Record<string, string>;
  };

  const states = Object.keys(report.counts).filter((key) => key !== 'observed' && key !== 'assessable');
  const lines: string[] = [
    `IID-1 identity coverage — asOf ${report.asOf}`,
    '',
    report.statusLine,
    '',
    'Identity sources',
    ...Object.entries(report.identitySources).map(([key, value]) => `  ${key}: ${value}`),
    '',
    'Counts',
    `  observed: ${report.counts.observed}`,
    `  assessable: ${report.counts.assessable}`,
    ...states.map((key) => `  ${key}: ${report.counts[key]}`),
    '',
    'By source (observed / resolved / unresolved / assessable)',
    ...Object.entries(report.bySource).map(
      ([source, counts]) => `  ${source}: ${counts.observed} / ${counts.resolved} / ${counts.unresolved} / ${counts.assessable}`,
    ),
    '',
    'Rows',
    ...report.items.map(
      (item) => `  ${item.observationId.padEnd(18)} ${item.source.padEnd(15)} ${item.state.padEnd(24)} ${item.reason ?? ''}`,
    ),
    '',
    'Corporate-action successor reconciliation',
    ...report.successorReconciliations.map(
      (entry) =>
        `  ${entry.actionId}: measured ${entry.measuredWeight} / unmeasured ${entry.unmeasuredWeight} → ${entry.reconciles ? 'reconciles' : 'DOES NOT RECONCILE'}`,
    ),
    '',
    'Source texts (sha256)',
    ...Object.entries(identitySourceTexts()).map(([file, text]) => `  ${file}: ${text.length} bytes`),
  ];
  writeFileSync(join(outputDir, 'coverage-summary.txt'), `${lines.join('\n')}\n`);
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
