/**
 * IID-0 — reference dataset loader for tests.
 *
 * Reads the committed synthetic fixtures, builds the dataset content, and (when asked) writes it to a
 * caller-supplied temporary directory. Deliberate defects live in the fixtures, not in the tests.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildDatasetContent, type DatasetInputs, type XbrlFileInput } from '../../src/investment/ingestion/builder';
import { writeDataset, type WriteResult } from '../../src/investment/ingestion/writer';
import type {
  CorporateActionRecord,
  DatasetContent,
  IssuerRecord,
  ListingRecord,
  PriceRecord,
  SecurityRecord,
} from '../../src/investment/fundamentals/types';

export const FIXTURES = join(__dirname, 'fixtures');

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function roster(): { issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] } {
  return readJson(join(FIXTURES, 'roster.json'));
}

export function referenceInputs(overrides: Partial<DatasetInputs> = {}): DatasetInputs {
  const base = roster();
  const filing: Omit<XbrlFileInput, 'text' | 'name'> = {
    issuerId: 'IN:EQISIN:IN0000000029',
    periodEnd: '2026-03-31',
    statementScope: 'CONSOLIDATED',
    filingRef: 'FIL-BODHI-FY26-XBRL',
    filedAt: '2026-05-16',
  };
  return {
    issuers: base.issuers,
    securities: base.securities,
    listings: base.listings,
    corporateActions: readJson<{ corporateActions: CorporateActionRecord[] }>(join(FIXTURES, 'corporate-actions.json')).corporateActions,
    prices: readJson<{ prices: PriceRecord[] }>(join(FIXTURES, 'prices.json')).prices,
    periodCsv: { name: 'periods.csv', text: readFileSync(join(FIXTURES, 'periods.csv'), 'utf8') },
    operatingMetricsCsv: { name: 'operating-metrics.csv', text: readFileSync(join(FIXTURES, 'operating-metrics.csv'), 'utf8') },
    xbrlFiles: [
      { ...filing, name: 'BODHI-FY26.xml', text: readFileSync(join(FIXTURES, 'xbrl', 'BODHI-FY26.xml'), 'utf8') },
    ],
    ...overrides,
  };
}

export function referenceContent(overrides: Partial<DatasetInputs> = {}): DatasetContent {
  return buildDatasetContent(referenceInputs(overrides));
}

export interface TempDataset {
  readonly dir: string;
  readonly content: DatasetContent;
  readonly written: WriteResult;
  cleanup(): void;
}

export function writeTempDataset(
  content: DatasetContent = referenceContent(),
  options: { readonly now?: string; readonly dir?: string } = {},
): TempDataset {
  const root = options.dir ?? mkdtempSync(join(tmpdir(), 'iid0-'));
  const dir = join(root, 'dataset');
  mkdirSync(root, { recursive: true });
  const written = writeDataset({
    dir,
    content,
    provider: 'test-fixture',
    licence: 'synthetic; not redistributable',
    now: options.now ?? '2026-11-05T00:00:00.000Z',
    importRunId: `run-${options.now ?? 'fixed'}`,
  });
  return {
    dir,
    content,
    written,
    cleanup(): void {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export function writeFile(path: string, text: string): void {
  writeFileSync(path, text, 'utf8');
}
