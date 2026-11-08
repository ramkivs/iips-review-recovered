/**
 * `L-038` residual investigation, 2026-11-08 — the probe behind `runs/01`…`runs/03`.
 *
 * It drives the **unmodified** governed capital-structure contract
 * (`iips-platform/src/investment/assessment/capitalStructure.ts`) with the **committed** dataset input of the
 * WI-7 / `L-038` bundle (`../WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input/periods.csv`). Nothing is written,
 * nothing is inferred, and no figure is entered by hand: every cell below is read from that file, scaled from the
 * crore the filing prints into the rupees the contract carries.
 *
 * Three runs, each answering one question the register leaves open:
 *
 *   A-1  What the contract does today, on the dataset the published payload is built from.
 *   A-2  What the *same* contract does when the block is given only 2023-03-31 — the one instant at which all four
 *        debt components and both cash components carry a filed number. No rule is relaxed for this run: the
 *        same-instant rule is satisfied, not suspended.
 *   B-1  A synthetic pair in which the debt side is complete at the newest instant and the cash side exists only at
 *        the older one, to establish whether the missing cash-side period check is reachable. The values are shaped
 *        like Marico's but are **not** Marico's, and no figure from this run is published anywhere.
 *
 * Run from the repository root:
 *   cd iips-platform && npx tsx ../evidence/real-issuer/WI7-L038-RESIDUAL-2026-11-08/probe/probe.ts
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCapitalStructure } from '../../../../iips-platform/src/investment/assessment/capitalStructure';
import { present, missing } from '../../../../iips-platform/src/investment/contracts/observation';
import type { FinancialPeriodView, SeriesSelection } from '../../../../iips-platform/src/investment/assessment/types';
import type { LineItemId } from '../../../../iips-platform/src/investment/contracts/lineItems';

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)));
const BUNDLE = resolve(HERE, '../../WI7-L038-DEBT-COMPLETENESS-2026-11-07');
const INPUT = join(BUNDLE, 'ingest-input/periods.csv');
const CRORE = 10_000_000;
const IDS: LineItemId[] = [
  'LONG_TERM_BORROWINGS',
  'SHORT_TERM_BORROWINGS',
  'CURRENT_MATURITIES_OF_LONG_TERM_DEBT',
  'LEASE_LIABILITIES',
  'CASH_AND_CASH_EQUIVALENTS',
  'CURRENT_INVESTMENTS',
  'PREFERENCE_CAPITAL',
];
const SOURCE = { kind: 'FILING' as const, ref: 'marico-fy24-ar:consolidated' };

function loadPeriods(): FinancialPeriodView[] {
  const text = readFileSync(INPUT, 'utf8');
  const rows = text.trim().split('\n');
  const head = rows[0].split(',');
  const periods = rows.slice(1).map((line) => {
    const cells = line.split(',');
    const get = (col: string): string => cells[head.indexOf(col)] ?? '';
    const values: Record<string, unknown> = {};
    for (const id of IDS) {
      const raw = get(id);
      // An empty cell carries no observation. It is *not* a zero, and it is not a nil either: the corrections
      // manifest is where a nil lives, and this file has none for the items below.
      if (raw === '') continue;
      values[id] = present(Number(raw) * CRORE, { ...SOURCE, ref: get('filing_ref') }, { periodEnd: get('period_end') });
    }
    return {
      periodEnd: get('period_end'),
      periodStart: get('period_start'),
      fiscalYear: Number(get('fiscal_year')),
      periodType: 'ANNUAL' as const,
      statementScope: 'CONSOLIDATED' as const,
      quarterForm: null,
      basis: 'AS_FILED' as const,
      filedAt: get('filed_at'),
      filingRef: get('filing_ref'),
      values: values as FinancialPeriodView['values'],
      derived: {},
    } as FinancialPeriodView;
  });
  return periods;
}

function series(annual: readonly FinancialPeriodView[]): SeriesSelection {
  return {
    statementScope: 'CONSOLIDATED',
    scopeSubstitution: false,
    annual,
    quarterly: [],
    ttm: null,
    excludedForScope: [],
    notes: [],
  };
}

const crore = (n: number | null | undefined): string =>
  n === null || n === undefined ? '—' : (n / CRORE).toLocaleString('en-US', { maximumFractionDigits: 0 });

function describe(obs: { presence: string; reason?: string; value?: unknown }): string {
  if (obs.presence === 'PRESENT') return `${crore(obs.value as number)} crore`;
  return `${obs.presence}${obs.reason === undefined ? '' : ':' + obs.reason}`;
}

function show(label: string, cs: ReturnType<typeof buildCapitalStructure>, periods: readonly FinancialPeriodView[]): void {
  console.log(`\n### ${label}`);
  console.log(`    periods given to the block: ${periods.map((p) => `${p.fiscalYear}@${p.periodEnd} (${p.filingRef})`).join(', ')}`);
  for (const name of [
    'shortTermBorrowings',
    'currentMaturities',
    'longTermBorrowings',
    'leaseLiabilities',
    'cashAndCashEquivalents',
    'currentInvestments',
    'preferenceCapital',
  ]) {
    const obs = cs.components[name];
    const period = obs.periodEnd ?? '—';
    console.log(`    ${name.padEnd(24)} ${describe(obs).padEnd(30)} @ ${period}`);
  }
  console.log(`    ${'—'.repeat(60)}`);
  console.log(`    ${'grossDebt'.padEnd(24)} ${describe(cs.grossDebt)}`);
  console.log(`    ${'cashAndInvestments'.padEnd(24)} ${describe(cs.cashAndInvestments)}`);
  console.log(`    ${'netDebt'.padEnd(24)} ${describe(cs.netDebt)}`);
  console.log(`    ${'preferenceCapital'.padEnd(24)} ${describe(cs.preferenceCapital)}`);
}

const all = loadPeriods();
console.log('# L-038 residual probe — the governed capital-structure contract, unmodified');
console.log(`# input : ${INPUT}`);
console.log(`# sha256: ${createHash('sha256').update(readFileSync(INPUT)).digest('hex')}`);
console.log(`# periods in file order (newest first): ${all.map((p) => `${p.fiscalYear}@${p.periodEnd} [${p.filingRef}]`).join(', ')}`);

show('A-1 · as published: every annual period the dataset carries, newest first', buildCapitalStructure(series(all), { asOf: '2026-11-08' }), all);

const fy23 = all.filter((p) => p.periodEnd === '2023-03-31');
show('A-2 · anchored at 2023-03-31: the one instant at which every required component carries a filed number', buildCapitalStructure(series(fy23), { asOf: '2026-11-08' }), fy23);

const debtComplete2024: FinancialPeriodView = {
  ...fy23[0],
  periodEnd: '2024-03-31',
  periodStart: '2023-04-01',
  fiscalYear: 2024,
  filingRef: 'SYNTHETIC-PROBE-NOT-A-FILING',
  values: {
    LONG_TERM_BORROWINGS: present(0, SOURCE, { periodEnd: '2024-03-31' }),
    SHORT_TERM_BORROWINGS: present(383 * CRORE, SOURCE, { periodEnd: '2024-03-31' }),
    CURRENT_MATURITIES_OF_LONG_TERM_DEBT: present(0, SOURCE, { periodEnd: '2024-03-31' }),
    LEASE_LIABILITIES: present(145 * CRORE, SOURCE, { periodEnd: '2024-03-31' }),
    PREFERENCE_CAPITAL: missing('NOT_REPORTED'),
  } as FinancialPeriodView['values'],
};
show(
  'B-1 · SYNTHETIC: debt complete @2024-03-31, cash only @2023-03-31  (no Marico figure is published from this run)',
  buildCapitalStructure(series([debtComplete2024, fy23[0]]), { asOf: '2026-11-08' }),
  [debtComplete2024, fy23[0]],
);
