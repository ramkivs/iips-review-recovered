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
import { equityValueFromEnterprise, perShare } from './capitalStructure';
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
 *
 * **The enterprise-to-equity step runs through the governed conversion, not a lookalike** (`L-040`). A grid
 * computed as `(EV − netDebt − minority − preference + associates) / shares` with `?? 0` on each term reads
 * an unavailable input as a nil: on an issuer whose net debt is `NOT_REPORTED` that publishes a per-share
 * number that no filing supports. The conversion therefore goes through `equityValueFromEnterprise()` and
 * `perShare()`, the same two functions the method's own per-share leg uses, so the grid can only produce a
 * per-share cell where the method itself could. When the conversion refuses, every `value` is `null`, the
 * grid carries `presence: NOT_COMPUTABLE` with the blocking reason and component, and the enterprise values
 * stay published as diagnostic arithmetic that is explicitly not a valuation.
 */
export function buildSensitivity(context: MethodContext): readonly SensitivityGrid[] {
  // The grid is evidence about the DCF arithmetic. When the sector excludes the DCF, or the arithmetic cannot
  // produce a base value, emitting a grid of nulls would suggest a computation that never happened.
  if (discountedCashFlow(context, context.wacc, context.growth) === null) return [];
  const baseWaccBps = Math.round(context.wacc * 10_000);
  const baseGrowthBps = Math.round(context.growth * 10_000);
  // The numerator period the per-share guard compares against `shareCountPeriod` is the newest annual period,
  // exactly as the method's own per-share leg takes it.
  const numeratorPeriodEnd = context.series.annual[0]?.periodEnd ?? null;
  let withheld: { reason: string; note: string | null } | null = null;
  const points: SensitivityPoint[] = [];
  for (const waccOffset of SENSITIVITY_OFFSETS_BPS) {
    for (const growthOffset of SENSITIVITY_OFFSETS_BPS) {
      const waccBps = baseWaccBps + waccOffset;
      const growthBps = baseGrowthBps + growthOffset;
      const enterpriseValue = discountedCashFlow(context, waccBps / 10_000, growthBps / 10_000);
      if (enterpriseValue === null) {
        // Out of domain (WACC ≤ terminal growth): the arithmetic refuses the cell, so there is no EV to publish.
        points.push({ waccBps, growthBps, value: null });
        continue;
      }
      const converted = perShare(
        equityValueFromEnterprise(present(enterpriseValue, DERIVED, { basis: 'DERIVED' }), context.structure),
        context.structure,
        numeratorPeriodEnd,
      );
      if (converted.presence !== 'PRESENT' || converted.value === null) {
        // No information about an input the conversion needs. The cell keeps its enterprise value as
        // diagnostic arithmetic and publishes NO per-share value; nothing is substituted with a zero.
        withheld ??= { reason: converted.reason ?? 'POLICY_INPUTS_UNAVAILABLE', note: converted.note ?? null };
        points.push({ waccBps, growthBps, value: null, enterpriseValue });
        continue;
      }
      points.push({ waccBps, growthBps, value: converted.value });
    }
  }
  const refused: { reason: string; note: string | null } | null = withheld;
  // The EV column exists only on a withheld grid, where it is the arithmetic that did run; on a healthy grid the
  // payload is unchanged, so every previously committed payload digest still reproduces. On a withheld grid every
  // cell carries the column explicitly — the enterprise value where the arithmetic ran, `null` where the cell is
  // out of domain — so the shape depends on the grid, never on the order the cells were computed in.
  const published =
    refused === null
      ? points.map((point) => ({ waccBps: point.waccBps, growthBps: point.growthBps, value: point.value }))
      : points.map((point) => ({
          waccBps: point.waccBps,
          growthBps: point.growthBps,
          value: point.value,
          enterpriseValue: point.enterpriseValue ?? null,
        }));
  return [
    {
      methodId: 'DCF_FCFF',
      baseWaccBps,
      baseGrowthBps,
      ...(refused === null
        ? {}
        : { withheld: { presence: 'NOT_COMPUTABLE' as const, reason: refused.reason, note: refused.note } }),
      points: published,
    },
  ];
}
