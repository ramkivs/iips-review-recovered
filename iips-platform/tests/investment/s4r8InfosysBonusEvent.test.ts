/**
 * IID Stage 4 — S4-R8 / G-8 / L-031: the first REAL admitted corporate action.
 *
 * The event is Infosys Limited's 1:1 bonus issue of 2018, supplied by the operator as a documented
 * statutory-filing record (evidence/real-issuer/S4-R8-INFOSYS-BONUS-2018-2026-11-20). These tests pin:
 *   1. the source reconciliation — the supplied share counts double exactly, so the canonical
 *      adjustment factor 0.5 is derived from the declared terms, not guessed;
 *   2. the canonical transcription validates, and corrupted variants are rejected;
 *   3. the candidate built by the real CLI carries exactly this one action, read back byte-faithfully;
 *   4. the assessment guard fires on the REAL action (unadjusted price refused by name) and the
 *      declared factor is applied to pre-action per-share points.
 *
 * The price used in (4) is a calendar-valid demonstration input; the corporate action is the real
 * read-back record. This is real-event evidence for the guard/factor limb, not a synthetic fixture.
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
import type { CorporateActionRecord, PriceRecord } from '../../src/investment/fundamentals/types';
import { boundedIpdBinding } from './exchangeCalendarFixtures';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const BUNDLE = join(EVIDENCE, 'S4-R8-INFOSYS-BONUS-2018-2026-11-20');
const INFOSYS_INPUT = join(BUNDLE, 'ingest-input', 'infosys');
const CANDIDATE_INPUTS = [
  INFOSYS_INPUT,
  join(EVIDENCE, 'S4-R3-Marico-QUARTERLY-REFRESH-2026-11-19', 'ingest-input', 'marico'),
  join(EVIDENCE, 'S4-R3-FILING-REFRESH-2026-11-14', 'ingest-input', 'kec'),
];
const CANDIDATE_DATASET_VERSION = 'sha256:a7638c6b8f23b067ab84f580805b918aea4b902c8e324026c7c7c942c09f5ab5';
const ISSUER = 'IN:CIN:L85110KA1981PLC013115';
const SECURITY = 'IN:ISIN:INE009A01021';
const ACTION_ID = 'CA-INFY-BONUS-2018-09-06';

const source = JSON.parse(readFileSync(join(BUNDLE, 'source', 'operator-supplied-event-2026-11-20.json'), 'utf8'));
const canonical = JSON.parse(readFileSync(join(INFOSYS_INPUT, 'corporate-actions.json'), 'utf8'));
const record = canonical.corporateActions[0] as CorporateActionRecord;

let dataRoot: string;
let installed: ReadDataset;

before(() => {
  dataRoot = mkdtempSync(join(tmpdir(), 'iid-s4-r8-bonus-'));
  const code = ingest([
    ...CANDIDATE_INPUTS.flatMap((dir) => ['--input', dir]),
    '--dataset-dir', join(dataRoot, 'investment', 'dataset'),
    '--now', '2026-11-20T00:00:00.000Z',
  ]);
  assert.equal(code, 0, 'the candidate must ingest through the real CLI');
  installed = readDataset(join(dataRoot, 'investment', 'dataset'));
});

after(() => rmSync(dataRoot, { recursive: true, force: true }));

describe('S4-R8 real event — source reconciliation (the factor is derived, not guessed)', () => {
  it('the supplied share counts double exactly and the paid-up capital agrees at INR 5 face value', () => {
    const event = source.event;
    assert.equal(event.post_event_shares, 2 * event.pre_event_shares);
    assert.equal(event.pre_event_shares * 5, event.pre_event_paid_up_capital_inr);
    assert.equal(event.post_event_shares * 5, event.post_event_paid_up_capital_inr);
  });

  it('the canonical factor equals pre/post share count (0.5) for the declared 1:1 ratio', () => {
    assert.equal(source.event.ratio, '1:1');
    assert.equal(record.adjustmentFactor, source.event.pre_event_shares / source.event.post_event_shares);
    assert.equal(record.adjustmentFactor, 0.5);
    assert.ok(record.adjustmentFactor! > 0, 'the existing positive-factor requirement holds');
  });

  it('the transcription carries only canonical fields; all other dates stay in the source evidence', () => {
    assert.equal(record.type, 'BONUS');
    assert.equal(record.effectiveDate, '2018-09-06');
    assert.equal(record.effectiveDate, source.dates.allotment_effective_date);
    assert.equal(record.subjectIssuerId, ISSUER);
    assert.equal(record.subjectSecurityId, SECURITY);
    assert.equal(record.perShareComparable, false);
    assert.deepEqual(record.successors, [], 'a BONUS has no successors; weight reconciliation is not applicable');
    assert.equal(source.dates.record_date, '2018-09-05');
    assert.equal(source.dates.ex_bonus_date, '2018-09-04');
  });
});

describe('S4-R8 real event — canonical validation and rejection of corrupted evidence', () => {
  it('the admitted record validates with zero issues', () => {
    const { table, issues } = validateCorporateActionRecords(canonical.corporateActions, new Set([ISSUER]));
    assert.deepEqual(issues, []);
    assert.equal(table?.actions.length, 1);
    assert.equal(table?.actions[0]?.actionId, ACTION_ID);
  });

  it('incomplete or invalid variants of the real record are rejected', () => {
    const variants: Record<string, unknown>[] = [
      { ...record, adjustmentFactor: -0.5 },
      { ...record, adjustmentFactor: 0 },
      { ...record, subjectIssuerId: 'IN:CIN:UNKNOWN' },
      { ...record, effectiveDate: '2018-13-06' },
      { ...record, type: 'DIVIDEND' },
    ];
    for (const variant of variants) {
      const { table, issues } = validateCorporateActionRecords([variant], new Set([ISSUER]));
      assert.equal(table, null);
      assert.ok(issues.length > 0);
    }
    const duplicate = validateCorporateActionRecords([record, record], new Set([ISSUER]));
    assert.equal(duplicate.table, null);
    assert.ok(duplicate.issues.some((issue) => issue.code === 'DUPLICATE_ACTION'));
  });
});

describe('S4-R8 real event — candidate dataset read-back', () => {
  it('the candidate carries exactly one corporate action, byte-faithful to the transcription', () => {
    assert.equal(installed.manifest.datasetVersion, CANDIDATE_DATASET_VERSION);
    assert.equal(installed.manifest.coverage.corporateActions, 1);
    assert.deepEqual(installed.content.issues, []);
    assert.equal(installed.content.corporateActions.length, 1);
    assert.deepEqual(installed.content.corporateActions[0], record);
  });
});

describe('S4-R8 real event — guard fires and the declared factor is applied (L-031 acceptance limb)', () => {
  const readBack = () => installed.content.corporateActions;
  const demoPrice = (adjustment: PriceRecord['adjustment']): PriceRecord => ({
    securityId: SECURITY, value: 1450, currency: 'INR', asOf: '2026-11-17', kind: 'CLOSE',
    source: 'DATASET_EOD', sourceRef: 'demonstration-price:s4r8-bonus-guard', adjustment,
  });
  const align = (adjustment: PriceRecord['adjustment']) => selectPrice({
    securityId: SECURITY,
    prices: [demoPrice(adjustment)],
    corporateActions: readBack(),
    listings: installed.content.listings,
    priceCalendar: boundedIpdBinding(SECURITY, 'NSE'),
    knownAsOf: '2026-11-16T09:00:00Z',
    generatedAt: '2026-11-19',
    dataAsOf: '2026-09-30',
  });

  it('an unadjusted price across the real bonus is refused by name', () => {
    const selection = align(null);
    assert.equal(selection.refusal, 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION');
    assert.match(selection.observation.note ?? '', new RegExp(ACTION_ID));
  });

  it('a price carrying the real action adjustment is accepted', () => {
    const selection = align({ factor: 0.5, corporateActionId: ACTION_ID });
    assert.equal(selection.refusal, null);
    assert.equal(selection.observation.value, 1450);
  });

  it('pre-action per-share points are restated by the declared factor; post-action points are unchanged', () => {
    const series = adjustPerShareSeries(
      [{ date: '2018-03-31', value: 100 }, { date: '2019-03-31', value: 60 }],
      readBack(), '2019-03-31',
    );
    assert.deepEqual(series.points.map((point) => [point.date, point.adjustedValue, point.state]), [
      ['2018-03-31', 50, 'ADJUSTED'],
      ['2019-03-31', 60, 'UNCHANGED'],
    ]);
    assert.deepEqual(series.appliedAdjustments.map((applied) => applied.actionId), [ACTION_ID]);
  });
});
