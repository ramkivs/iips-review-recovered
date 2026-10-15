/**
 * MoSPI Windows verification preparation — contract-assertion validation harness.
 *
 * Purpose: prove that the checks embedded in
 * `mospi-windows-route-verification.ps1` match the transport's REAL response
 * contract, by driving the actual `/api/macro` handler over an injected stub
 * fetch (no live network call, no repository mutation) and running the same
 * assertion set against the genuine handler output.
 *
 * Run from the repository's `frontend/` directory:
 *     npx tsx ../evidence/integration/mospi-live-e2e-windows-verification-2026-10-15/validate-route-contracts.ts
 *
 * Fixture shapes are taken from the supplied Windows evidence (CPI/IIP) and the
 * governed filter/observation contracts; they are synthetic and are NOT offered
 * as live data.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleMacroRequest } from '../../../frontend/server/macro/macro-transport.js';

const makeReq = (url: string, method = 'GET') => ({ url, method } as unknown as IncomingMessage);

const makeRes = () => {
  const res = {
    status: 0,
    ct: '',
    body: '',
    writeHead(status: number, headers?: Record<string, string>) {
      res.status = status;
      res.ct = headers?.['Content-Type'] ?? '';
      return res;
    },
    end(data?: string) {
      res.body = data ?? '';
      return res;
    },
  };
  return res as unknown as ServerResponse & { status: number; ct: string; body: string };
};

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, headers: { get: () => null }, json: async () => body } as unknown as Response);

const envelope = (records: unknown[], totalRecords = records.length) => ({
  data: records,
  meta_data: { page: 1, totalRecords, totalPages: 1, recordPerPage: records.length },
  statusCode: true,
});

const sleepOff = async (): Promise<void> => {};

const CPI = envelope([
  {
    baseyear: '2012', year: 2025, month: 'December', state: 'All India', sector: 'Rural',
    group: 'Consumer Food Price', subgroup: 'Consumer Food Price-Overall', index: '198.5', inflation: '-3.03', status: 'F',
  },
]);
const IIP_OBS = envelope([
  { base_year: '2022-23', year: 2026, month: 'March', type: 'Sectoral', category: 'Manufacturing', sub_category: 'Synthetic A', index: '173.2', growth_rate: '4.1' },
]);
const NAS_OBS = envelope([
  { base_year: '2022-23', series: 'Current', year: '2024-25', indicator: 'Gross Value Added', frequency: 'Annually', current_price: '100.0' },
]);
const FILTER = {
  data: {
    type: [{ type: 'General' }, { type: 'Sectoral' }, { type: 'Use-based category' }],
    category: [
      { category_code: 12, category_name: 'Mining & Quarrying', type: 'Sectoral' },
      { category_code: 2, category_name: 'Manufacturing', type: 'Sectoral' },
    ],
    subcategory: [{ subcategory_code: '022011-1210', category_code: 2, subcategory_name: 'Synthetic A' }],
  },
  statusCode: true,
};

async function probe(url: string, fetchImpl: typeof fetch) {
  const res = makeRes();
  await handleMacroRequest(makeReq(url), res, { config: { fetchImpl, sleepImpl: sleepOff } });
  return res;
}

async function main(): Promise<void> {
const cpi = await probe('/api/macro/cpi', (async () => jsonResponse(CPI)) as unknown as typeof fetch);
const nas = await probe('/api/macro/nas?indicator=GVA', (async () => jsonResponse(NAS_OBS)) as unknown as typeof fetch);
const iipMeta = await probe('/api/macro/iip', (async () => jsonResponse(FILTER)) as unknown as typeof fetch);
const iipObs = await probe(
  '/api/macro/iip?subcategoryCode=022011-1210',
  (async (u: string) => (String(u).includes('getIipFilter') ? jsonResponse(FILTER) : jsonResponse(IIP_OBS))) as unknown as typeof fetch,
);
// The observed live failure shape from Arena (recorded 2026-10-15): a 502 wrapper.
const upstreamDown = await probe('/api/macro/cpi', (async () => { throw new TypeError('fetch failed'); }) as unknown as typeof fetch);

console.log('Contract-assertion validation against REAL /api/macro handler output');
console.log('(injected stub fetch; no live network call, no repository mutation)');
console.log('');

for (const [label, r] of [
  ['P1 /api/macro/cpi', cpi],
  ['P4 /api/macro/nas?indicator=GVA', nas],
  ['P2 /api/macro/iip (metadata)', iipMeta],
  ['P3 /api/macro/iip?subcategoryCode=022011-1210', iipObs],
  ['negative control: upstream unreachable', upstreamDown],
] as const) {
  console.log(`===== ${label} -> HTTP ${r.status}  Content-Type=${r.ct}`);
  console.log(r.body);
  const b = JSON.parse(r.body) as Record<string, unknown>;
  if (r.status !== 200) {
    console.log(`  classification: HTTP_FAILURE with code=${String(b.code)} (no records field: ${b.records === undefined})`);
    console.log('');
    continue;
  }
  const checks: Array<[string, boolean]> = [
    ['dataset present', typeof b.dataset === 'string' || b.dataset !== undefined],
    ['source === MoSPI', b.source === 'MoSPI'],
    ['records is an array', Array.isArray(b.records)],
  ];
  const pagination = b.pagination as { expectedRecords: number; actualRecords: number } | undefined;
  if (pagination) {
    checks.push(['pagination.expectedRecords === actualRecords === records.length',
      pagination.expectedRecords === pagination.actualRecords && pagination.actualRecords === (b.records as unknown[]).length]);
  }
  const provenance = b.provenance as { retrievalCompleteness?: string } | undefined;
  if (provenance) checks.push(["provenance.retrievalCompleteness === 'COMPLETE'", provenance.retrievalCompleteness === 'COMPLETE']);
  const selection = b.selection as { type?: string; categoryName?: string; subcategoryCodes?: string[] } | undefined;
  if (selection) {
    checks.push(["selection.type === 'Sectoral'", selection.type === 'Sectoral']);
    checks.push(["selection.categoryName === 'Manufacturing'", selection.categoryName === 'Manufacturing']);
    checks.push(['selection.subcategoryCodes non-empty and all match ^\\d{4,}-\\d{3,}$',
      Array.isArray(selection.subcategoryCodes) && selection.subcategoryCodes.length > 0 && selection.subcategoryCodes.every((c) => /^\d{4,}-\d{3,}$/.test(c))]);
  }
  for (const [name, ok] of checks) console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}`);
  console.log(`  records length = ${(b.records as unknown[]).length}`);
  console.log('');
}

console.log('Governed IIP code shape (IIP_SUBCATEGORY_CODE_PATTERN = /^\\d{4,}-\\d{3,}$/), evaluated by the');
console.log("application's own query builder:");
for (const code of ['2100-01', '1210', '022011-1210', '022011-1232']) {
  const { buildIipQuery } = await import('../../../frontend/server/macro/mospi-source.js');
  let verdict: string;
  try {
    buildIipQuery({ baseYear: '2022-23', frequency: 'Annually', type: 'Sectoral', categoryCode: 2, subcategoryCode: code }, 1, 100);
    verdict = 'ACCEPTED';
  } catch (e) {
    verdict = `REJECTED -> ${(e as Error).message}`;
  }
  console.log(`  ${code.padEnd(12)} ${verdict}`);
}
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
