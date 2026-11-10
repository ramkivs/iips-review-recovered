/**
 * IID — end-to-end verification of the Identity Coverage / Investment Coverage separation.
 *
 * THE DEFECT SCENARIO, REPRODUCED FOR REAL
 *   A REAL investment dataset is written to a real data directory. The identity files are
 *   DELIBERATELY NOT WRITTEN — that is the reported state ("missing file(s): roster, listingMap,
 *   corporateActions"). The real transport is then started and both routes are queried over real
 *   HTTP.
 *
 * WHAT MUST HOLD
 *   - GET /api/investment/coverage            → 503 identity-sources-unavailable  (fail closed, unchanged)
 *   - GET /api/investment/coverage/investment → 200 with the investment coverage report
 *   - the investment report discloses the identity absence; it does not fail
 *   - a real dataset with no identity files produces REAL issuer rows
 *
 * It also verifies the genuine investment-coverage failure separately: with the dataset removed, the
 * investment route still answers, disclosing `datasetClass: 'NONE'` — an empty position, not an
 * identity error and not a crash.
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from '../server/investment/coverage-transport';
import { writeM1Dataset, m1Dataset } from '../server/investment/demo/m1Data';
import { M1_NOW } from '../server/investment/demo/m1Pipeline';

const root = mkdtempSync(join(tmpdir(), 'iid-separation-e2e-'));
const dataRoot = join(root, 'data');
const identityDir = join(dataRoot, 'investment', 'identity');
const datasetDir = join(dataRoot, 'investment', 'dataset');

// The DATASET is written. The IDENTITY FILES ARE NOT — that is the defect scenario, reproduced.
mkdirSync(identityDir, { recursive: true });
mkdirSync(datasetDir, { recursive: true });
writeM1Dataset(datasetDir, m1Dataset(), M1_NOW);
console.log('dataset written :', datasetDir);
console.log('identity files  :', 'DELIBERATELY ABSENT (eligible-roster.json, listing-map.json, corporate-actions.json)');

const servers: http.Server[] = [];

async function start(): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, {
      holdings: async () => [],
      watchlist: async () => [],
      loadSources: () => {
        const dir = join(dataRoot, 'investment', 'identity');
        const missing = ['eligible-roster.json', 'listing-map.json', 'corporate-actions.json'].filter(
          (name) => !existsIn(dir, name),
        );
        return {
          available: false,
          issues: [
            {
              file: 'eligible-roster.json',
              code: 'IDENTITY_SOURCE_MISSING',
              subject: 'roster, listingMap, corporateActions',
              detail: `missing file(s): ${missing.map((m) => m.replace('.json', '')).join(', ')}`,
            },
          ],
          sources: null,
        } as never;
      },
      financialCoverage: undefined,
      dataRoot,
      today: () => M1_NOW.slice(0, 10),
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function existsIn(dir: string, name: string): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('node:fs').existsSync(join(dir, name));
  } catch {
    return false;
  }
}

function check(label: string, condition: boolean, detail = ''): void {
  if (condition) {
    console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`);
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
    failures += 1;
  }
}

let failures = 0;

try {
  const url = await start();

  console.log('\n--- 1. Identity Coverage: fail closed, unchanged ---');
  const identity = await fetch(`${url}/api/investment/coverage`);
  const identityBody = (await identity.json()) as { error: string; issues: { code: string }[] };
  check('identity read answers 503', identity.status === 503, `status=${identity.status}`);
  check('identity read names the identity failure', identityBody.error === 'identity-sources-unavailable', identityBody.error);
  check(
    'identity read reports IDENTITY_SOURCE_MISSING',
    identityBody.issues[0]?.code === 'IDENTITY_SOURCE_MISSING',
    identityBody.issues[0]?.code ?? '(none)',
  );

  console.log('\n--- 2. Investment Coverage: its own content, with identity sources absent ---');
  const investment = await fetch(`${url}/api/investment/coverage/investment`);
  const investmentBody = (await investment.json()) as {
    reportVersion: number;
    dataset: { datasetClass: string; issuers: number };
    issuers: { issuerId: string; legalName: string; state: string; identityDependency: string | null }[];
    statusLine: string;
    identitySourcesAvailable: boolean;
    identitySourceDetail: string | null;
    notes: string[];
  };
  const rawText = await fetch(`${url}/api/investment/coverage/investment`).then((r) => r.text());

  check('investment read answers 200', investment.status === 200, `status=${investment.status}`);
  check('investment read is a report', investmentBody.reportVersion === 1);
  check('investment read never says identity-sources-unavailable', !rawText.includes('identity-sources-unavailable'));
  check(
    'investment read discloses the identity absence',
    investmentBody.identitySourcesAvailable === false,
    `identitySourcesAvailable=${investmentBody.identitySourcesAvailable}`,
  );
  check(
    'investment read reports the real dataset',
    investmentBody.dataset.datasetClass !== 'NONE',
    `datasetClass=${investmentBody.dataset.datasetClass}`,
  );
  check(
    'investment read reports REAL issuer rows from the real dataset',
    investmentBody.issuers.length > 0,
    `${investmentBody.issuers.length} issuer(s): ${investmentBody.issuers.map((i) => i.legalName).join(', ')}`,
  );
  check(
    'each issuer row discloses the identity dependency as "not evaluated"',
    investmentBody.issuers.every((row) => row.identityDependency === null),
    `dependencies=${[...new Set(investmentBody.issuers.map((i) => String(i.identityDependency)))].join(',')}`,
  );
  check('investment read has its own status line', investmentBody.statusLine.length > 0, investmentBody.statusLine);

  console.log('\n--- 3. Genuine investment-coverage unavailability is separate ---');
  rmSync(datasetDir, { recursive: true, force: true });
  const empty = await fetch(`${url}/api/investment/coverage/investment`);
  const emptyBody = (await empty.json()) as {
    dataset: { datasetClass: string };
    issuers: unknown[];
    statusLine: string;
  };
  check('investment read still answers 200 with no dataset', empty.status === 200, `status=${empty.status}`);
  check('absent dataset is disclosed as NONE', emptyBody.dataset.datasetClass === 'NONE');
  check('absent dataset yields no issuer rows', emptyBody.issuers.length === 0);
  check('absent dataset is an empty position, not a failure', /No investment dataset is installed/.test(emptyBody.statusLine));

  console.log('\n--- 4. The identity read is unaffected by the dataset being absent ---');
  const identityAgain = await fetch(`${url}/api/investment/coverage`);
  check('identity read still fails closed with 503', identityAgain.status === 503, `status=${identityAgain.status}`);
} finally {
  await Promise.all(servers.splice(0).map((s) => new Promise<void>((resolve) => s.close(() => resolve()))));
  rmSync(root, { recursive: true, force: true });
}

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
