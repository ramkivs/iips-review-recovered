/**
 * IID-2 — price alignment and margin of safety (AC-2.10, R-6, `mos-policy/1.0.0`).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { assessCompany } from '../../src/investment/assessment/engine';
import { selectPrice } from '../../src/investment/assessment/margin';
import { renderAssessmentHtml } from '../../src/investment/assessment/view';
import type { CorporateActionRecord, PriceRecord } from '../../src/investment/fundamentals/types';
import { techAssessmentInput, techDataset, TECH_ISSUER } from './assessmentFixtures';

const price = (overrides: Partial<PriceRecord> = {}): PriceRecord => ({
  securityId: TECH_ISSUER,
  value: 850,
  currency: 'INR',
  asOf: '2026-07-24',
  kind: 'CLOSE',
  source: 'DATASET_EOD',
  sourceRef: 'eod:2026-07-24',
  adjustment: { factor: 0.2, corporateActionId: 'CA-TECH-SPLIT-2026' },
  ...overrides,
});

const alignment = (overrides: Partial<Parameters<typeof selectPrice>[0]> = {}) =>
  selectPrice({
    securityId: TECH_ISSUER,
    prices: [price()],
    corporateActions: techDataset().corporateActions,
    knownAsOf: '2026-07-23T17:44:46Z',
    generatedAt: '2026-07-25',
    dataAsOf: '2026-06-30',
    ...overrides,
  });

describe('AC-2.10 — a margin of safety requires a price inside the policy window', () => {
  test('no observation is refused by name, and the block still explains itself', () => {
    const { payload } = assessCompany(techAssessmentInput({ dataset: techDataset({ prices: [] }) }));
    const mos = payload.valuation.marginOfSafety!;
    assert.equal(mos.refusal, 'NO_PRICE_OBSERVATION');
    assert.equal(mos.price.presence, 'MISSING');
    assert.equal(mos.price.reason, 'PRICE_UNAVAILABLE');
    assert.equal(mos.band, null);
    assert.equal(mos.mosVsMid.presence, 'NOT_COMPUTABLE');
    assert.ok(payload.quality.flags.some((flag) => flag.code === 'STALE_STATEMENTS') === false);
  });

  test('a price older than the policy window is refused as stale, not used', () => {
    const selection = alignment({ knownAsOf: '2026-07-01T09:00:00Z', prices: [price({ asOf: '2026-07-10' })] });
    assert.equal(selection.refusal, 'PRICE_OUTSIDE_POLICY_WINDOW');
    assert.equal(selection.observation.presence, 'MISSING');
    assert.equal(selection.observation.reason, 'PRICE_STALE');
    assert.match(selection.observation.note ?? '', /policy window is 7/);
  });

  test('a price that predates the knowledge cutoff is refused rather than read as foresight', () => {
    const selection = alignment({ prices: [price({ asOf: '2026-07-20' })] });
    assert.equal(selection.refusal, 'PRICE_PREDATES_KNOWLEDGE_CUTOFF');
    assert.equal(selection.observation.reason, 'PRICE_STALE');
  });

  test('an unadjusted price across a split is refused, never silently adjusted by the reader', () => {
    const selection = alignment({ prices: [price({ adjustment: null })] });
    assert.equal(selection.refusal, 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION');
    assert.equal(selection.observation.reason, 'PRICE_STALE');
    assert.match(selection.observation.note ?? '', /CA-TECH-SPLIT-2026/);
  });

  test('a price already adjusted for the action is accepted', () => {
    const selection = alignment();
    assert.equal(selection.refusal, null);
    assert.equal(selection.observation.value, 850);
    assert.equal(selection.asOf, '2026-07-24');
  });

  test('an action that does not affect per-share comparability does not block the price', () => {
    const buyback: CorporateActionRecord = {
      actionId: 'CA-TECH-BUYBACK',
      type: 'BUYBACK',
      effectiveDate: '2026-06-01',
      subjectIssuerId: TECH_ISSUER,
      subjectSecurityId: TECH_ISSUER,
      perShareComparable: true,
      adjustmentFactor: 1,
      factorBasis: 'tender buyback, no per-share restatement',
      successors: [],
      sourceRef: 'ca-table:fixture',
    };
    const selection = alignment({
      prices: [price({ adjustment: null })],
      corporateActions: [buyback],
    });
    assert.equal(selection.refusal, null);
  });
});

describe('the band is a policy function of the margin, and the policy version travels with it', () => {
  const bandFor = (priceValue: number) => {
    const { payload } = assessCompany(
      techAssessmentInput({ dataset: techDataset({ prices: [price({ value: priceValue })] }) }),
    );
    const mos = payload.valuation.marginOfSafety!;
    return { mos, mid: payload.valuation.intrinsic!.perShare.mid.value! };
  };

  test('a price far below the midpoint is a deep discount and the arithmetic is visible', () => {
    const { mos, mid } = bandFor(300);
    assert.equal(mos.band, 'DEEP_DISCOUNT');
    const expected = (mid - 300) / mid;
    assert.ok(Math.abs((mos.mosVsMid.value ?? 0) - expected) < 1e-12);
    assert.ok((mos.mosVsLow.value ?? 0) > 0);
    assert.equal(mos.bandPolicyVersion, 'mos-policy/1.0.0');
    assert.equal(mos.refusal, null);
  });

  test('the bands step through discount, fair, premium and significant premium', () => {
    assert.equal(bandFor(400).mos.band, 'DISCOUNT');
    assert.equal(bandFor(470).mos.band, 'FAIR');
    assert.equal(bandFor(600).mos.band, 'PREMIUM');
    assert.equal(bandFor(850).mos.band, 'SIGNIFICANT_PREMIUM');
  });

  test('the payload states that the margin is decision support, not a recommendation', () => {
    const { payload } = assessCompany(techAssessmentInput());
    assert.equal(payload.disclosure.decisionSupportOnly, true);
    assert.equal(payload.disclosure.noTradeExecution, true);
    assert.equal(payload.disclosure.nonProduction, true);
  });

  test('without an intrinsic range the margin is withheld and the reason is the intrinsic, not the price', () => {
    const { payload } = assessCompany(
      techAssessmentInput({ dataset: techDataset({ operatingMetrics: [] }) }),
    );
    const intrinsic = payload.valuation.intrinsic;
    const mos = payload.valuation.marginOfSafety!;
    if (intrinsic === null) {
      assert.equal(mos.refusal, 'INTRINSIC_WITHHELD');
      assert.equal(mos.band, null);
    } else {
      assert.equal(mos.refusal, null);
    }
  });
});

describe('D-4.4 — corporate-action adjustment enforcement and disclosure in valuation', () => {
  test('an issuer-wide corporate action (subjectSecurityId: null) refuses an unadjusted price in assessCompany', () => {
    const issuerWideBonus: CorporateActionRecord = {
      actionId: 'CA-TECH-BONUS-2026',
      type: 'BONUS',
      effectiveDate: '2026-07-24',
      subjectIssuerId: TECH_ISSUER,
      subjectSecurityId: null,
      perShareComparable: false,
      adjustmentFactor: 0.5,
      factorBasis: '1:1 bonus issue',
      successors: [],
      sourceRef: 'ca-table:fixture',
    };
    const { payload, narrative } = assessCompany(
      techAssessmentInput({
        dataset: techDataset({
          prices: [price({ adjustment: null })],
          corporateActions: [issuerWideBonus],
        }),
      }),
    );
    const mos = payload.valuation.marginOfSafety!;
    assert.equal(mos.refusal, 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION');
    assert.equal(mos.price.presence, 'MISSING');
    assert.equal(mos.price.value, null);
    assert.equal(mos.band, null);
    assert.match(mos.price.note ?? '', /CA-TECH-BONUS-2026/);
    assert.ok(
      narrative.some((line) => line.includes('UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION') && line.includes('CA-TECH-BONUS-2026')),
    );
    const html = renderAssessmentHtml(payload, narrative);
    assert.ok(html.includes('UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION'));
    assert.ok(html.includes('CA-TECH-BONUS-2026'));
    assert.ok(html.includes('never silently adjusted'));
  });

  test('an issuer-wide corporate action for a different issuer does not block the subject security', () => {
    const otherIssuerSplit: CorporateActionRecord = {
      actionId: 'CA-OTHER-SPLIT-2026',
      type: 'SPLIT',
      effectiveDate: '2026-07-24',
      subjectIssuerId: 'IN:EQISIN:IN9999999999',
      subjectSecurityId: null,
      perShareComparable: false,
      adjustmentFactor: 0.2,
      factorBasis: 'other issuer 1:5 split',
      successors: [],
      sourceRef: 'ca-table:fixture',
    };
    const selection = alignment({
      issuerId: TECH_ISSUER,
      prices: [price({ adjustment: null })],
      corporateActions: [otherIssuerSplit],
    });
    assert.equal(selection.refusal, null);
    assert.equal(selection.observation.value, 850);
  });

  test('an effectiveDate matching the calendar date of an ISO generatedAt timestamp still blocks an unadjusted price', () => {
    const selection = alignment({
      issuerId: TECH_ISSUER,
      generatedAt: '2026-07-25T10:00:00Z',
      prices: [price({ asOf: '2026-07-25', adjustment: null })],
      corporateActions: [
        {
          actionId: 'CA-TECH-SAMEDAY-SPLIT',
          type: 'SPLIT',
          effectiveDate: '2026-07-25',
          subjectIssuerId: TECH_ISSUER,
          subjectSecurityId: null,
          perShareComparable: false,
          adjustmentFactor: 0.5,
          factorBasis: 'same-day split',
          successors: [],
          sourceRef: 'ca-table:fixture',
        },
      ],
    });
    assert.equal(selection.refusal, 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION');
    assert.match(selection.observation.note ?? '', /CA-TECH-SAMEDAY-SPLIT/);
  });

  test('invalid or mismatched adjustment factors on a price record are refused', () => {
    for (const badFactor of [0, -0.2, Number.NaN, 0.5]) {
      const selection = alignment({
        prices: [price({ adjustment: { factor: badFactor, corporateActionId: 'CA-TECH-SPLIT-2026' } })],
      });
      assert.equal(selection.refusal, 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION');
      assert.equal(selection.observation.presence, 'MISSING');
      assert.equal(selection.observation.value, null);
    }
  });

  test('a non-R-6 price source (e.g. unverified raw D02 feed) is refused at runtime', () => {
    const selection = alignment({
      prices: [price({ source: 'DHAN_D02_OHLCV' as unknown as PriceRecord['source'] })],
    });
    assert.equal(selection.refusal, 'INADMISSIBLE_PRICE_SOURCE');
    assert.equal(selection.observation.presence, 'MISSING');
    assert.equal(selection.observation.reason, 'PRICE_UNAVAILABLE');
    assert.match(selection.observation.note ?? '', /DHAN_D02_OHLCV/);
  });
});
