/**
 * IID-2 — intrinsic blend (INV-5) and sensitivity grid.
 *
 * INV-5 is the whole point of this module: an intrinsic range exists only when **every** weighted method
 * produced a present per-share number. A blend that quietly drops a method is a fabricated midpoint, so the
 * withheld inputs are named instead. The weights are published, renormalised over the applicable methods and
 * summing to exactly 1.
 */
import type { NumericObservation } from '../contracts/observation';
import { notComputable, present } from '../contracts/observation';
import type { MethodId } from '../coverage/methodMatrix';
import { blendWeights } from './policy';
import { discountedCashFlow, type MethodContext } from './methods';
import type {
  BlendWeight,
  IntrinsicRange,
  SensitivityGrid,
  SensitivityPoint,
  ValuationMethodResult,
} from './types';

const DERIVED = { kind: 'DERIVED' as const, ref: 'intrinsic-blend/1.0.0' };

export interface IntrinsicOutcome {
  readonly intrinsic: IntrinsicRange | null;
  readonly weights: readonly BlendWeight[];
  readonly unmetInputs: readonly string[];
}

/**
 * Weighted blend of the applicable methods.
 *
 * Returns `intrinsic: null` with `unmetInputs` when any weighted method has no output, when a per-share leg
 * is absent (for example a share-count period mismatch), or when nothing is applicable at all.
 */
export function buildIntrinsic(methods: readonly ValuationMethodResult[]): IntrinsicOutcome {
  const applicable = methods.filter((method) => method.applicable);
  const weights = blendWeights(applicable.map((method) => ({ methodId: method.methodId, role: method.role })));
  if (weights.length === 0) {
    return { intrinsic: null, weights, unmetInputs: ['NO_APPLICABLE_METHOD'] };
  }

  const unmet: string[] = [];
  const byId = new Map<MethodId, ValuationMethodResult>(methods.map((method) => [method.methodId, method]));

  for (const weight of weights) {
    const method = byId.get(weight.methodId);
    if (method === undefined || method.output === null) {
      unmet.push(`${weight.methodId}:NO_OUTPUT`);
      continue;
    }
    for (const leg of ['perShareLow', 'perShareMid', 'perShareHigh'] as const) {
      const observation = method.output[leg];
      if (observation.presence !== 'PRESENT' || observation.value === null) {
        unmet.push(`${weight.methodId}:${leg}:${observation.reason ?? 'NOT_REPORTED'}`);
      }
    }
  }

  if (unmet.length > 0) {
    return { intrinsic: null, weights, unmetInputs: unmet };
  }

  const weighted = (leg: 'perShareLow' | 'perShareMid' | 'perShareHigh'): number =>
    weights.reduce((total, weight) => {
      const method = byId.get(weight.methodId)!;
      return total + (method.output![leg].value ?? 0) * weight.weight;
    }, 0);

  const low = weighted('perShareLow');
  const mid = weighted('perShareMid');
  const high = weighted('perShareHigh');
  const spread: NumericObservation =
    mid === 0
      ? notComputable('DIVISION_BY_ZERO')
      : present((high - low) / mid, DERIVED, { basis: 'DERIVED' });

  return {
    intrinsic: {
      currency: 'INR',
      perShare: {
        low: present(low, DERIVED, { basis: 'DERIVED' }),
        mid: present(mid, DERIVED, { basis: 'DERIVED' }),
        high: present(high, DERIVED, { basis: 'DERIVED' }),
      },
      weighting: weights,
      spreadPct: spread,
      withheld: null,
    },
    weights,
    unmetInputs: [],
  };
}

/** Offsets, in basis points, the grid is evaluated at. Base point included exactly once. */
export const SENSITIVITY_OFFSETS_BPS: readonly number[] = Object.freeze([-100, 0, 100]);

/**
 * WACC × terminal-growth grid for the DCF family, computed with the same arithmetic the method used.
 *
 * Monotonicity is a property of the arithmetic, not an assertion in prose: value falls as WACC rises and
 * rises as terminal growth rises across the declared domain, which the acceptance test checks point by
 * point. Points outside the domain (WACC ≤ g) are `null` — a refused cell, never a clamped number.
 */
export function buildSensitivity(context: MethodContext): readonly SensitivityGrid[] {
  // The grid is evidence about the DCF arithmetic. When the sector excludes the DCF, or the arithmetic cannot
  // produce a base value, emitting a grid of nulls would suggest a computation that never happened.
  if (discountedCashFlow(context, context.wacc, context.growth) === null) return [];
  const baseWaccBps = Math.round(context.wacc * 10_000);
  const baseGrowthBps = Math.round(context.growth * 10_000);
  const points: SensitivityPoint[] = [];
  for (const waccOffset of SENSITIVITY_OFFSETS_BPS) {
    for (const growthOffset of SENSITIVITY_OFFSETS_BPS) {
      const waccBps = baseWaccBps + waccOffset;
      const growthBps = baseGrowthBps + growthOffset;
      const enterpriseValue = discountedCashFlow(context, waccBps / 10_000, growthBps / 10_000);
      const value =
        enterpriseValue === null ||
        context.structure.dilutedShares.presence !== 'PRESENT' ||
        context.structure.dilutedShares.value === null ||
        context.structure.dilutedShares.value <= 0
          ? null
          : {
              ev: enterpriseValue,
              shares: context.structure.dilutedShares.value,
            };
      points.push({
        waccBps,
        growthBps,
        value:
          value === null
            ? null
            : (value.ev -
                (context.structure.netDebt.value ?? 0) -
                (context.structure.minorityInterest.value ?? 0) -
                (context.structure.preferenceCapital.value ?? 0) +
                (context.structure.associatesAndJV.value ?? 0)) /
              value.shares,
      });
    }
  }
  return [
    {
      methodId: 'DCF_FCFF',
      baseWaccBps,
      baseGrowthBps,
      points,
    },
  ];
}
