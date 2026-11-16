/**
 * W05 — Real HTTP regression for `/api/investment/coverage/investment` source-rights classification.
 *
 * Verifies that the frontend server transport (`coverage-transport.ts` -> `investmentCoverageFromLocalDataset`)
 * serves `datasetClass` and `sourceRights` strictly from `DatasetManifest.sourceRights`, never upgrading
 * `UNKNOWN` (such as pre-W05 datasets lacking `sourceRights`) or `SYNTHETIC` datasets to `OPERATOR_SUPPLIED`,
 * and returns 503 `investment-coverage-unavailable` when `sourceRights` is malformed.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from './coverage-transport';
import { m1Dataset, writeM1Dataset } from './demo/m1Data';
import { M1_NOW } from './demo/m1Pipeline';

const AS_OF = '2026-11-12';
const COMMITTED_INFOSYS_DATASET = resolve(
  process.cwd(),
  '../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/dataset',
);

const servers: http.Server[] = [];
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((done) => {
          server.close(() => done());
        }),
    ),
  );
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

async function startWithDataRoot(dataRoot: string): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, {
      holdings: async () => [],
      watchlist: async () => [],
      dataRoot,
      today: () => AS_OF,
    });
  });
  servers.push(server);
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', () => done()));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

describe('W05 — /api/investment/coverage/investment source-rights HTTP contract', () => {
  it('serves datasetClass=UNKNOWN (never OPERATOR_SUPPLIED) for a pre-W05 dataset with no sourceRights field', async () => {
    const dataRoot = mkdtempSync(join(tmpdir(), 'w05-http-unknown-'));
    tempDirs.push(dataRoot);
    const datasetDir = join(dataRoot, 'investment', 'dataset');
    mkdirSync(join(dataRoot, 'investment'), { recursive: true });
    cpSync(COMMITTED_INFOSYS_DATASET, datasetDir, { recursive: true });

    const base = await startWithDataRoot(dataRoot);
    const res = await fetch(`${base}/api/investment/coverage/investment`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      dataset: {
        datasetClass: string;
        provider: string;
        sourceRights: { state: string; basis: string; note: string };
      };
      financialCoverage: { datasetClass: string };
      notes: string[];
    };
    expect(body.dataset.provider).toBe('operator-file-input');
    expect(body.dataset.datasetClass).toBe('UNKNOWN');
    expect(body.dataset.sourceRights.state).toBe('UNKNOWN');
    expect(body.financialCoverage.datasetClass).toBe('UNKNOWN');
    expect(body.notes.some((n) => n.includes('UNKNOWN'))).toBe(true);
  });

  it('serves datasetClass=SYNTHETIC_FIXTURE for the M1 synthetic dataset even though its provider omits "fixture"', async () => {
    const dataRoot = mkdtempSync(join(tmpdir(), 'w05-http-m1-'));
    tempDirs.push(dataRoot);
    const datasetDir = join(dataRoot, 'investment', 'dataset');
    mkdirSync(datasetDir, { recursive: true });
    writeM1Dataset(datasetDir, m1Dataset(), M1_NOW);

    const base = await startWithDataRoot(dataRoot);
    const res = await fetch(`${base}/api/investment/coverage/investment`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      dataset: {
        datasetClass: string;
        sourceRights: { state: string };
      };
      financialCoverage: { datasetClass: string };
    };
    expect(body.dataset.datasetClass).toBe('SYNTHETIC_FIXTURE');
    expect(body.dataset.sourceRights.state).toBe('SYNTHETIC');
    expect(body.financialCoverage.datasetClass).toBe('SYNTHETIC_FIXTURE');
  });

  it('returns 503 investment-coverage-unavailable when manifest.sourceRights is OPERATOR_ASSERTED with blank basis', async () => {
    const dataRoot = mkdtempSync(join(tmpdir(), 'w05-http-invalid-'));
    tempDirs.push(dataRoot);
    const datasetDir = join(dataRoot, 'investment', 'dataset');
    mkdirSync(join(dataRoot, 'investment'), { recursive: true });
    cpSync(COMMITTED_INFOSYS_DATASET, datasetDir, { recursive: true });

    const manifestPath = join(datasetDir, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    manifest.sourceRights = { state: 'OPERATOR_ASSERTED', basis: '   ', note: '' };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    const base = await startWithDataRoot(dataRoot);
    const res = await fetch(`${base}/api/investment/coverage/investment`);
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string; issues: { code: string }[] };
    expect(body.error).toBe('investment-coverage-unavailable');
    expect(body.issues[0]?.code).toBe('INVESTMENT_DATASET_UNREADABLE');
  });
});
