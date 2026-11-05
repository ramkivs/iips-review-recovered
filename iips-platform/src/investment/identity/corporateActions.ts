/**
 * IID-1 — corporate-action model and application layer.
 *
 * `adjustmentFactor` is defined once, here, so the arithmetic cannot drift: it is the multiplier that
 * converts a PRE-action per-share value into POST-action terms. A 1:5 split has factor 0.2 (old price
 * 1000 → 200; old EPS 50 → 10). Both price and per-share earnings use the same factor, which is what
 * makes the consistency check meaningful.
 *
 * Two things this layer refuses to do:
 *   - it never adjusts a series silently: every adjustment is listed with the action that caused it;
 *   - it never invents a factor. An action that is not per-share comparable and carries no factor makes
 *     the series `NOT_COMPARABLE` across that boundary, which is reported rather than smoothed over.
 */
import type { CorporateActionRecord, CorporateActionType } from '../fundamentals/types';
import type { CorporateActionTable, IdentitySources } from './types';

/** Actions whose per-share effect is expressed by an `adjustmentFactor`. */
export const ADJUSTING_ACTION_TYPES: readonly CorporateActionType[] = Object.freeze([
  'SPLIT',
  'BONUS',
  'CONSOLIDATION',
  'RIGHTS',
  'BUYBACK_TENDER',
  'BUYBACK_OPEN_MARKET',
  'PREFERENCE_REDEMPTION',
  'CAPITAL_REDUCTION',
]);

/** Actions that re-key identity rather than scale a per-share value. */
export const REKEYING_ACTION_TYPES: readonly CorporateActionType[] = Object.freeze([
  'MERGER',
  'DEMERGER',
  'SYMBOL_CHANGE',
  'NAME_CHANGE',
  'DELISTING',
]);

export const FACTOR_SEMANTICS =
  'adjustmentFactor converts a pre-action per-share value into post-action terms (1:5 split => 0.2).';

export function actionsForIssuer(
  table: CorporateActionTable,
  issuerId: string,
  options: { readonly asOf?: string; readonly securityId?: string } = {},
): readonly CorporateActionRecord[] {
  return table.actions
    .filter((action) => action.subjectIssuerId === issuerId)
    .filter((action) => (options.asOf === undefined ? true : action.effectiveDate <= options.asOf))
    .filter((action) => (options.securityId === undefined ? true : action.subjectSecurityId === null || action.subjectSecurityId === options.securityId))
    .slice()
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.actionId.localeCompare(b.actionId));
}

export interface AppliedAdjustment {
  readonly actionId: string;
  readonly type: CorporateActionType;
  readonly effectiveDate: string;
  readonly factor: number;
  readonly factorBasis: string | null;
}

export type SeriesPointState = 'ADJUSTED' | 'UNCHANGED' | 'NOT_COMPARABLE';

export interface AdjustedPoint {
  readonly date: string;
  readonly value: number;
  /** The value expressed in post-action terms, or `null` when comparability is broken. */
  readonly adjustedValue: number | null;
  readonly state: SeriesPointState;
  readonly appliedActionIds: readonly string[];
  readonly blockedBy: readonly string[];
}

export interface AdjustedSeries {
  readonly points: readonly AdjustedPoint[];
  readonly appliedAdjustments: readonly AppliedAdjustment[];
  readonly notComparableAcross: readonly string[];
}

/**
 * Restate a per-share series into the terms in force at `asOf`.
 *
 * Only actions with an effective date strictly after a point's date affect that point. Actions with no
 * factor and no per-share comparability block comparability for every earlier point instead of being
 * ignored.
 */
export function adjustPerShareSeries(
  points: readonly { readonly date: string; readonly value: number }[],
  actions: readonly CorporateActionRecord[],
  asOf: string,
): AdjustedSeries {
  const relevant = actions
    .filter((action) => action.effectiveDate <= asOf)
    .filter((action) => ADJUSTING_ACTION_TYPES.includes(action.type))
    .slice()
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.actionId.localeCompare(b.actionId));

  const applied: AppliedAdjustment[] = [];
  for (const action of relevant) {
    if (action.adjustmentFactor !== null) {
      applied.push({
        actionId: action.actionId,
        type: action.type,
        effectiveDate: action.effectiveDate,
        factor: action.adjustmentFactor,
        factorBasis: action.factorBasis,
      });
    }
  }

  const blocking = relevant.filter((action) => action.adjustmentFactor === null);

  const adjusted: AdjustedPoint[] = [...points]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((point) => {
      const adjustments = applied.filter((adjustment) => adjustment.effectiveDate > point.date);
      const blockers = blocking.filter((action) => action.effectiveDate > point.date);
      const factor = adjustments.reduce((product, adjustment) => product * adjustment.factor, 1);
      const state: SeriesPointState =
        blockers.length > 0 ? 'NOT_COMPARABLE' : adjustments.length === 0 ? 'UNCHANGED' : 'ADJUSTED';
      return {
        date: point.date,
        value: point.value,
        adjustedValue: state === 'NOT_COMPARABLE' ? null : round(point.value * factor),
        state,
        appliedActionIds: adjustments.map((adjustment) => adjustment.actionId),
        blockedBy: blockers.map((action) => action.actionId),
      };
    });

  return {
    points: adjusted,
    appliedAdjustments: applied,
    notComparableAcross: blocking.map((action) => action.actionId),
  };
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export interface ConsistencyCheck {
  readonly consistent: boolean;
  readonly tolerance: number;
  readonly observations: readonly {
    readonly metric: 'PRICE' | 'PER_SHARE_EARNINGS';
    readonly before: number;
    readonly after: number;
    readonly expectedAfter: number;
    readonly deviationPct: number;
  }[];
}

/**
 * Verify that a per-share discontinuity is explained by the declared factor.
 *
 * Tolerance is expressed as a fraction (0.0001 = 0.01 %), matching AC-1.8. The check is two-sided in
 * spirit — a price that fell by "about" the factor while EPS did not is still a failure.
 */
export function verifyPerShareConsistency(input: {
  readonly priceBefore: number;
  readonly priceAfter: number;
  readonly earningsBefore: number;
  readonly earningsAfter: number;
  readonly factor: number;
  readonly tolerance?: number;
}): ConsistencyCheck {
  const tolerance = input.tolerance ?? 0.0001;
  const priceExpected = input.priceBefore * input.factor;
  const earningsExpected = input.earningsBefore * input.factor;
  const priceDeviation = Math.abs(input.priceAfter - priceExpected) / Math.abs(input.priceAfter === 0 ? 1 : input.priceAfter);
  const earningsDeviation =
    Math.abs(input.earningsAfter - earningsExpected) / Math.abs(input.earningsAfter === 0 ? 1 : input.earningsAfter);
  return {
    consistent: priceDeviation <= tolerance && earningsDeviation <= tolerance,
    tolerance,
    observations: [
      {
        metric: 'PRICE',
        before: input.priceBefore,
        after: input.priceAfter,
        expectedAfter: round(priceExpected),
        deviationPct: Math.round(priceDeviation * 1e6) / 1e4,
      },
      {
        metric: 'PER_SHARE_EARNINGS',
        before: input.earningsBefore,
        after: input.earningsAfter,
        expectedAfter: round(earningsExpected),
        deviationPct: Math.round(earningsDeviation * 1e6) / 1e4,
      },
    ],
  };
}

export interface SuccessorSlice {
  readonly issuerId: string | null;
  readonly ratio: number;
  readonly mapped: boolean;
  /** Why an unmapped slice stays unresolved — never guessed from a similar name. */
  readonly reason: 'SUCCESSOR_NOT_IN_ELIGIBLE_ROSTER' | 'SUCCESSOR_UNKNOWN' | null;
}

export interface SuccessorReconciliation {
  readonly actionId: string;
  readonly type: CorporateActionType;
  readonly effectiveDate: string;
  readonly slices: readonly SuccessorSlice[];
  readonly measuredWeight: number;
  readonly unmeasuredWeight: number;
  readonly unresolvedSlices: readonly SuccessorSlice[];
  readonly reconciles: boolean;
}

/**
 * Re-key a merger/demerger into successor slices (AC-1.7).
 *
 * A successor that is not in the eligible roster is NOT dropped and NOT approximated: it becomes an
 * unmapped slice carrying its weight, so measured + unmeasured weight always reconciles to 1.
 */
export function reconcileSuccessors(
  table: CorporateActionTable,
  issuerId: string,
  eligibleIssuerIds: readonly string[],
): readonly SuccessorReconciliation[] {
  const eligible = new Set(eligibleIssuerIds);
  return table.actions
    .filter((action) => action.subjectIssuerId === issuerId)
    .filter((action) => action.type === 'MERGER' || action.type === 'DEMERGER')
    .slice()
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.actionId.localeCompare(b.actionId))
    .map((action) => {
      const slices: SuccessorSlice[] = action.successors.map((successor) => {
        const mapped = eligible.has(successor.issuerId) && successor.issuerId.trim() !== '';
        return {
          issuerId: mapped ? successor.issuerId : successor.issuerId.trim() === '' ? null : successor.issuerId,
          ratio: successor.ratio,
          mapped,
          reason: mapped ? null : successor.issuerId.trim() === '' ? 'SUCCESSOR_UNKNOWN' : 'SUCCESSOR_NOT_IN_ELIGIBLE_ROSTER',
        };
      });
      const measuredWeight = round(slices.filter((slice) => slice.mapped).reduce((sum, slice) => sum + slice.ratio, 0));
      const unmeasuredWeight = round(slices.filter((slice) => !slice.mapped).reduce((sum, slice) => sum + slice.ratio, 0));
      return {
        actionId: action.actionId,
        type: action.type,
        effectiveDate: action.effectiveDate,
        slices,
        measuredWeight,
        unmeasuredWeight,
        unresolvedSlices: slices.filter((slice) => !slice.mapped),
        reconciles: Math.abs(measuredWeight + unmeasuredWeight - 1) <= 1e-9,
      };
    });
}

export interface SymbolHistoryEntry {
  readonly listingId: string;
  readonly symbol: string;
  readonly exchange: string;
  readonly series: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

/** Every listing a security has ever had, oldest first — the basis for STALE_REFERENCE detection. */
export function symbolHistory(sources: IdentitySources, securityId: string): readonly SymbolHistoryEntry[] {
  return sources.listingMap.entries
    .filter((entry) => entry.securityId === securityId)
    .slice()
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom) || a.symbol.localeCompare(b.symbol))
    .map((entry) => ({
      listingId: entry.listingId,
      symbol: entry.symbol,
      exchange: entry.exchange,
      series: entry.series,
      effectiveFrom: entry.effectiveFrom,
      effectiveTo: entry.effectiveTo,
    }));
}
