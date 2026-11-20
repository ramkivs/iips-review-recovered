/**
 * IID Stage 4 — L-031 window coverage: the operator-declared Infosys table for 2024-03-31 → 2026-11-20.
 *
 * The declared table (evidence/real-issuer/L031-INFOSYS-WINDOW-COVERAGE-2026-11-20) states explicitly
 * that no bonus, split, rights issue, merger or demerger occurred in the window, and lists six cash
 * dividends plus one tender-offer buyback. These tests pin the governed treatment:
 *   1. the declaration's own arithmetic reconciles (share-count bridge; INR 18,000 Cr consideration);
 *   2. only the canonically representable event is transcribed — BUYBACK_TENDER joins the preserved
 *      2018 BONUS; DIVIDEND is not a canonical type and the dividends stay documented, not transcribed;
 *   3. the candidate built by the real CLI carries both actions, read back byte-faithfully;
 *   4. the buyback (perShareComparable, factor 1) neither blocks an unadjusted price nor restates
 *      per-share points, while the 2018 bonus continues to apply its declared 0.5.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run as ingest } from '../../src/investment/cli/ingest';
import { readDataset, type ReadDataset } from '../../src/investment/ingestion/writer';
import { validateCorporateActionRecords } from '../../src/investment/identity/sources';
import { adjustPerShareSeries } from '../../src/investment/identity/corporateActions';
import { selectPrice } from '../../src/investment/assessment/margin';
import type { PriceRecord } from '../../src/investment/fundamentals/types';
import { boundedIpdBinding } from './exchangeCalendarFixtures';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'L031-INFOSYS-WINDOW-COVERAGE-2026-11-20');
const INFOSYS_INPUT = join(BUNDLE, 'ingest-input', 'infosys');
const CANDIDATE_INPUTS = [
  INFOSYS_INPUT,
  join(EVIDENCE, 'S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19', 'ingest-input', 'marico'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec'),
];
const CANDIDATE_DATASET_VERSION = 'sha256:d2b65bccd5d8ff289119068eb1c03f094a232c9ea6a754b060b76f9386f509bd';
const ISSUER = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY = 'IN:ISIN:INE009A01021';
const BONUS_ID = 'CA-INFY-BONUS-2018-09-06';
const BUYBACK_ID = 'CA-INFY-BUYBACK-TENDER-2025-12-04';

const declared = JSON.parse(readFileSync(join(BUNDLE, 'source', 'operator-declared-window-table-2026-11-20.json'), 'utf8'));
const canonical = JSON.parse(readFileSync(join(INFOSYS_INPUT, 'corporate-actions.json'), 'utf8'));
const priorBonus = JSON.parse(readFileSync(
  join(EVIDENCE, 'S4-R8-INFOSYS-BONUS-2018-2026-11-20', 'ingest-input', 'infosys', 'corporate-actions.json'), 'utf8',
)).corporateActions[0];

let dataRoot: string;
let installed: ReadDataset;

before(() => {
  dataRoot = mkdtempSync(join(tmpdir(), 'iid-l031-window-'));
  const code = ingest([
    ...CANDIDATE_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir', join(dataRoot, 'investment', 'dataset'),
    '--now', '2026-11-20T00:00:00.000Z',
  ]);
  assert.equal(code, 0, 'the candidate must ingest through the real CLI');
  installed = readDataset(join(dataRoot, 'investment', 'dataset'));
});

after(() => rmSync(dataRoot, { recursive: true, force: true }));

describe('L-031 window table — the declaration reconciles on its own terms', () => {
  it('the explicit nil declaration covers the whole L-031 window', () => {
    assert.equal(declared.declaration.window_start, '2024-03-31');
    assert.equal(declared.declaration.window_end, '2026-11-20');
    assert.match(declared.declaration.explicit_nil_declaration, /no bonus issues, stock splits, rights issues, mergers, or demergers/i);
    assert.match(declared.declaration.explicit_nil_declaration, /Face value remained unchanged at INR 5/);
  });

  it('the buyback share-count bridge and consideration reconcile exactly', () => {
    const buyback = declared.events.find((event: { action_type: string }) => event.action_type.includes('Buyback'));
    const bridge = buyback.share_count_bridge;
    assert.equal(bridge['shares_at_record_date_2025-11-14'], 4154401349);
    assert.equal(
      bridge['shares_at_record_date_2025-11-14'] - bridge.shares_extinguished + bridge['rsu_shares_allotted_2025-11-20'],
      bridge.shares_post_extinguishment,
    );
    assert.equal(bridge.shares_extinguished * 1800, 18000 * 10_000_000, 'INR 18,000 crore');
  });
});

describe('L-031 window table — governed transcription (representable events only)', () => {
  it('exactly two canonical records exist: the preserved 2018 BONUS and the window BUYBACK_TENDER', () => {
    assert.equal(canonical.corporateActions.length, 2);
    assert.deepEqual(canonical.corporateActions[0], priorBonus, 'the admitted 2018 record is preserved byte-faithfully');
    const buyback = canonical.corporateActions[1];
    assert.equal(buyback.actionId, BUYBACK_ID);
    assert.equal(buyback.type, 'BUYBACK_TENDER');
    assert.equal(buyback.effectiveDate, '2025-12-04');
    assert.equal(buyback.perShareComparable, true);
    assert.equal(buyback.adjustmentFactor, 1);
    assert.deepEqual(buyback.successors, []);
  });

  it('the six dividends are documented in the declaration but never transcribed (no canonical DIVIDEND type)', () => {
    const dividends = declared.events.filter((event: { action_type: string }) => event.action_type.includes('Dividend'));
    assert.equal(dividends.length, 6);
    assert.ok(canonical.corporateActions.every((action: { type: string }) => action.type !== 'DIVIDEND'));
  });

  it('both records validate with zero issues', () => {
    const { table, issues } = validateCorporateActionRecords(canonical.corporateActions, new Set([ISSUER]));
    assert.deepEqual(issues, []);
    assert.equal(table?.actions.length, 2);
  });
});

describe('L-031 window coverage — candidate read-back and behaviour', () => {
  it('the candidate carries both actions and no ingestion issues', () => {
    assert.equal(installed.manifest.datasetVersion, CANDIDATE_DATASET_VERSION);
    assert.equal(installed.manifest.coverage.corporateActions, 2);
    assert.deepEqual(installed.content.issues, []);
    assert.deepEqual(installed.content.corporateActions, canonical.corporateActions);
  });

  it('the buyback does not block an unadjusted price, and restates nothing', () => {
    const price: PriceRecord = {
      securityId: SECURITY, value: 1450, currency: 'INR', asOf: '2026-11-17', kind: 'CLOSE',
      source: 'DATASET_EOD', sourceRef: 'demonstration-price:l031-window', adjustment: null,
    };
    const selection = selectPrice({
      securityId: SECURITY,
      prices: [price],
      corporateActions: installed.content.corporateActions.filter((action) => action.actionId === BUYBACK_ID),
      listings: installed.content.listings,
      priceCalendar: boundedIpdBinding(SECURITY, 'NSE'),
      knownAsOf: '2026-11-16T09:00:00Z',
      generatedAt: '2026-11-19',
      dataAsOf: '2026-09-30',
    });
    assert.equal(selection.refusal, null, 'a per-share-comparable buyback is not a comparability break');

    const series = adjustPerShareSeries(
      [{ date: '2018-03-31', value: 100 }, { date: '2026-03-31', value: 80 }],
      installed.content.corporateActions, '2026-03-31',
    );
    assert.deepEqual(series.points.map((point) => [point.date, point.adjustedValue, point.state]), [
      ['2018-03-31', 50, 'ADJUSTED'],
      ['2026-03-31', 80, 'UNCHANGED'],
    ], 'only the 2018 bonus restates; the buyback factor 1 changes nothing');
  });
});
