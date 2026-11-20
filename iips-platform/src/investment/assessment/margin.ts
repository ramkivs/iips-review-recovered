/**
 * IID-2 — price alignment and margin of safety (R-6, `mos-policy/1.1.0`).
 *
 * A margin of safety is only an answer if the price is the right price on the right day. Five refusals are
 * enforced here, and each names itself in `refusal` so the surface can say why rather than showing a dash:
 *
 *   1. no price for the security at or before `generatedAt`           → `PRICE_UNAVAILABLE`
 *   2. price older than the policy window (5 trading sessions, L-033)  → `PRICE_STALE`
 *   3. price dated before `knownAsOf` (look-ahead)                     → `PRICE_STALE`
 *   4. no verified calendar/mapping, a non-session price date, or a date outside the calendar's continuous
 *      coverage                                                       → refused by its calendar reason
 *   5. a per-share-affecting corporate action between the price date and the period end with no applied
 *      factor                                                        → `PRICE_STALE` (refused, not adjusted)
 *
 * No substitution of any kind is performed: not yesterday's close, not another listing's price, not an
 * unadjusted price across a split.
 */
import type { NumericObservation } from '../contracts/observation';
import { missing, notComputable, present } from '../contracts/observation';
import type { CorporateActionRecord, ListingRecord, PriceRecord } from '../fundamentals/types';
import { evaluatePriceFreshness, exchangeLocalDate, type PriceCalendarBinding, type PriceFreshnessAssessment } from './exchangeCalendar';
import { MOS_POLICY_VERSION } from './types';
import { VALUATION_POLICY, mosBandFor } from './policy';
import type { IntrinsicRange, MarginOfSafetyBlock } from './types';

export interface PriceAlignmentInput {
  readonly securityId: string;
  readonly prices: readonly PriceRecord[];
  readonly corporateActions: readonly CorporateActionRecord[];
  readonly listings?: readonly ListingRecord[];
  /** L-033: the explicit security → exchange-calendar binding. Absent means the price cannot be aged. */
  readonly priceCalendar?: PriceCalendarBinding;
  readonly knownAsOf: string;
  readonly generatedAt: string;
  readonly dataAsOf: string;
}

export interface PriceSelection {
  readonly observation: NumericObservation;
  readonly asOf: string | null;
  readonly refusal: string | null;
  readonly freshness: PriceFreshnessAssessment;
}

/** Choose the price the assessment is allowed to use, or refuse and say why. */
export function selectPrice(input: PriceAlignmentInput): PriceSelection {
  const assessmentDate = exchangeLocalDate(input.generatedAt);
  const maxTradingSessions = VALUATION_POLICY.freshness.priceMaxAgeTradingSessions;
  const candidates = input.prices
    .filter((price) => price.securityId === input.securityId)
    .map((price) => ({ price, date: exchangeLocalDate(price.asOf) }))
    .filter((candidate) => candidate.date !== null && assessmentDate !== null && candidate.date <= assessmentDate)
    .sort((a, b) => (a.date! < b.date! ? 1 : a.date! > b.date! ? -1 : a.price.asOf < b.price.asOf ? 1 : a.price.asOf > b.price.asOf ? -1 : 0));

  if (candidates.length === 0) {
    return {
      observation: missing('PRICE_UNAVAILABLE'),
      asOf: null,
      refusal: 'NO_PRICE_OBSERVATION',
      freshness: evaluatePriceFreshness({
        binding: input.priceCalendar,
        listings: input.listings,
        securityId: input.securityId,
        observationDate: null,
        assessmentDate,
        maxTradingSessions,
      }),
    };
  }

  const { price, date: priceDate } = candidates[0]!;
  const freshness = evaluatePriceFreshness({
    binding: input.priceCalendar,
    listings: input.listings,
    securityId: input.securityId,
    observationDate: priceDate,
    assessmentDate,
    maxTradingSessions,
  });
  const source = {
    kind: 'MARKET_PRICE' as const,
    ref: price.sourceRef,
    filedAt: price.asOf,
  };
  const asObservation = (note?: string): NumericObservation =>
    note === undefined
      ? present(price.value, source, { basis: 'AS_FILED', periodEnd: price.asOf })
      : { ...present(price.value, source, { basis: 'AS_FILED', periodEnd: price.asOf }), note };

  const knownDate = exchangeLocalDate(input.knownAsOf);
  if (knownDate === null || priceDate! < knownDate) {
    return {
      observation: { ...asObservation('price predates the knowledge cutoff'), presence: 'MISSING', value: null, reason: 'PRICE_STALE' },
      asOf: price.asOf,
      refusal: 'PRICE_PREDATES_KNOWLEDGE_CUTOFF',
      freshness,
    };
  }

  if (freshness.status === 'UNAVAILABLE') {
    const reason = freshness.reason ?? 'PRICE_CALENDAR_UNAVAILABLE';
    return {
      observation: {
        ...asObservation(freshness.detail ?? reason),
        presence: 'MISSING',
        value: null,
        reason: reason === 'PRICE_ON_NON_SESSION_DATE' ? 'PRICE_STALE' : 'PRICE_UNAVAILABLE',
      },
      asOf: price.asOf,
      refusal: reason,
      freshness,
    };
  }

  if (freshness.status === 'OUTSIDE_WINDOW') {
    return {
      observation: {
        ...asObservation(freshness.detail ?? `price is more than ${maxTradingSessions} trading sessions old`),
        presence: 'MISSING',
        value: null,
        reason: 'PRICE_STALE',
      },
      asOf: price.asOf,
      refusal: 'PRICE_OUTSIDE_POLICY_WINDOW',
      freshness,
    };
  }

  // An action becomes a comparability break from the moment it is effective: a price observed after it sits
  // on the post-action share base while the filings are on the pre-action base, and a price observed before
  // it sits on the pre-action base while later filings are restated. In both directions the record must
  // carry the applied factor, or the comparison is refused rather than half-made.
  const needingAdjustment = input.corporateActions.filter(
    (action) =>
      action.subjectSecurityId === input.securityId &&
      action.perShareComparable === false &&
      action.effectiveDate <= input.generatedAt,
  );
  const unadjusted = needingAdjustment.filter((action) => price.adjustment === null || price.adjustment.corporateActionId !== action.actionId);
  if (unadjusted.length > 0) {
    return {
      observation: {
        ...asObservation(`unadjusted across ${unadjusted.map((action) => action.actionId).join(', ')}`),
        presence: 'MISSING',
        value: null,
        reason: 'PRICE_STALE',
      },
      asOf: price.asOf,
      refusal: 'UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION',
      freshness,
    };
  }

  return { observation: asObservation(), asOf: price.asOf, refusal: null, freshness };
}

/** Margin of safety against the intrinsic midpoint and low, with the policy band. */
export function buildMarginOfSafety(price: PriceSelection, intrinsic: IntrinsicRange | null): MarginOfSafetyBlock {
  const priceObservation = price.observation;
  if (intrinsic === null) {
    return {
      price: priceObservation,
      priceAsOf: price.asOf,
      mosVsMid: notComputable('POLICY_INPUTS_UNAVAILABLE'),
      mosVsLow: notComputable('POLICY_INPUTS_UNAVAILABLE'),
      band: null,
      bandPolicyVersion: MOS_POLICY_VERSION,
      refusal: price.refusal ?? 'INTRINSIC_WITHHELD',
      priceFreshness: price.freshness,
    };
  }

  const mid = intrinsic.perShare.mid;
  const low = intrinsic.perShare.low;
  if (priceObservation.presence !== 'PRESENT' || priceObservation.value === null) {
    return {
      price: priceObservation,
      priceAsOf: price.asOf,
      mosVsMid: notComputable(priceObservation.reason ?? 'PRICE_UNAVAILABLE'),
      mosVsLow: notComputable(priceObservation.reason ?? 'PRICE_UNAVAILABLE'),
      band: null,
      bandPolicyVersion: MOS_POLICY_VERSION,
      refusal: price.refusal ?? 'PRICE_UNAVAILABLE',
      priceFreshness: price.freshness,
    };
  }

  const priceValue = priceObservation.value;
  if (mid.presence !== 'PRESENT' || mid.value === null || mid.value === 0) {
    return {
      price: priceObservation,
      priceAsOf: price.asOf,
      mosVsMid: notComputable('DIVISION_BY_ZERO'),
      mosVsLow: notComputable('DIVISION_BY_ZERO'),
      band: null,
      bandPolicyVersion: MOS_POLICY_VERSION,
      refusal: 'INTRINSIC_WITHHELD',
      priceFreshness: price.freshness,
    };
  }

  const mosMid = (mid.value - priceValue) / mid.value;
  const mosLow =
    low.presence === 'PRESENT' && low.value !== null && low.value !== 0
      ? (low.value - priceValue) / low.value
      : null;

  return {
    price: priceObservation,
    priceAsOf: price.asOf,
    mosVsMid: present(mosMid, { kind: 'DERIVED', ref: 'mos/1.0.0' }, { basis: 'DERIVED' }),
    mosVsLow:
      mosLow === null
        ? notComputable('POLICY_INPUTS_UNAVAILABLE')
        : present(mosLow, { kind: 'DERIVED', ref: 'mos/1.0.0' }, { basis: 'DERIVED' }),
    band: mosBandFor(mosMid),
    bandPolicyVersion: MOS_POLICY_VERSION,
    refusal: null,
    priceFreshness: price.freshness,
  };
}
