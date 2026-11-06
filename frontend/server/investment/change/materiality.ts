/**
 * IID-5 — materiality policy `materiality-policy/1.0.0`.
 *
 * FOUR LEVELS, EXPLICIT THRESHOLDS. A number moving is not an investment fact. This module is the only place
 * that decides how much a movement matters, and the thresholds are published, versioned and recorded in every
 * change report — so a reader can disagree with the policy rather than with a hidden constant.
 *
 * WHY A DECLARED MODE RATHER THAN ONE PERCENTAGE RULE. `±10 %` of revenue and `±10 %` of a margin are not the
 * same measurement: revenue is additive, a margin is a level (percentage points), leverage is a multiple and a
 * confidence weight is a probability. Each dimension therefore declares its comparison mode, and the policy
 * declares the thresholds for that mode. Mixing them would make a 10 % margin move look like a 10 % revenue
 * move.
 *
 * NO SILENT SUPPRESSION. `IMMATERIAL` is a level, not a synonym for "drop it": every detected dimension change
 * is emitted with its level, because `summary.byCategory` must reconcile with the item list (design §A3.3).
 */
import { ReportValidationError } from '../../reports/artifact.js';

/** Version of the threshold policy. Recorded in every change report's provenance. */
export const MATERIALITY_POLICY_VERSION = 'materiality-policy/1.0.0' as const;

/** Closed level set, ordered from least to most significant. */
export const MATERIALITY_LEVELS = Object.freeze(['IMMATERIAL', 'NOTABLE', 'MATERIAL', 'CRITICAL'] as const);
export type MaterialityLevel = (typeof MATERIALITY_LEVELS)[number];

/** How a dimension's delta is measured before it is compared with thresholds. */
export const COMPARISON_MODES = Object.freeze([
  /** Relative percentage change against the `from` value (`|Δ| / |from| × 100`). */
  'RELATIVE_PCT',
  /** Absolute delta in the dimension's own unit. */
  'ABSOLUTE',
  /** Absolute delta expressed in basis points (the dimension's value is a fraction such as a margin). */
  'BASIS_POINTS',
  /** Absolute delta in percentage points (the dimension's value is already a percentage). */
  'PERCENTAGE_POINTS',
  /** Ordinal/categorical: level comes from the declared scale transition, never from arithmetic. */
  'DECLARED',
] as const);
export type ComparisonMode = (typeof COMPARISON_MODES)[number];

export interface Thresholds {
  readonly mode: ComparisonMode;
  /** Below this, a change is `IMMATERIAL`. Absent for `DECLARED` dimensions. */
  readonly notable?: number;
  readonly material?: number;
  readonly critical?: number;
}

/**
 * The published threshold table (design §A3.4), expressed per mode.
 *
 * `DECLARED` dimensions carry their own transition rules in the dimension map; a numeric threshold there would
 * be a category error.
 */
export const THRESHOLDS = Object.freeze({
  /** Reported financial values, per-share values, intrinsic value: ±5 / ±10 / ±25 %. */
  reportedValue: Object.freeze({ mode: 'RELATIVE_PCT', notable: 5, material: 10, critical: 25 }),
  /** Intrinsic per-share mid: ±5 / ±10 / ±20 % (design §A3.4). */
  intrinsicValue: Object.freeze({ mode: 'RELATIVE_PCT', notable: 5, material: 10, critical: 20 }),
  /** Growth trends and margins, in basis points: ±100 / ±200 / ±400. */
  rateInBasisPoints: Object.freeze({ mode: 'BASIS_POINTS', notable: 100, material: 200, critical: 400 }),
  /** Leverage multiples: ±0.25× / ±0.5× / ±1.0×. */
  multiple: Object.freeze({ mode: 'ABSOLUTE', notable: 0.25, material: 0.5, critical: 1 }),
  /** Margin of safety and portfolio weights, in percentage points: ±5 / ±10 / band crossing. */
  percentagePoints: Object.freeze({ mode: 'PERCENTAGE_POINTS', notable: 5, material: 10, critical: 20 }),
  /** Confidence-like fractions (0..1) compared in percentage points of confidence: ±2 / ±5 / ±10. */
  confidence: Object.freeze({ mode: 'PERCENTAGE_POINTS', notable: 2, material: 5, critical: 10 }),
  /** Ordinal and nominal dimensions: level comes from the declared transition. */
  declared: Object.freeze({ mode: 'DECLARED' }),
} as const);

export type ThresholdName = keyof typeof THRESHOLDS;

const ORDER: Readonly<Record<MaterialityLevel, number>> = Object.freeze({
  IMMATERIAL: 0,
  NOTABLE: 1,
  MATERIAL: 2,
  CRITICAL: 3,
});

/** The higher of two levels. Never returns a lower level than either input. */
export function mostSevere(a: MaterialityLevel, b: MaterialityLevel): MaterialityLevel {
  return ORDER[a] >= ORDER[b] ? a : b;
}

export function atLeast(level: MaterialityLevel, floor: MaterialityLevel): boolean {
  return ORDER[level] >= ORDER[floor];
}

/** The measured magnitude and the unit its thresholds are expressed in. */
export interface MeasuredDelta {
  readonly magnitude: number;
  readonly mode: ComparisonMode;
}

/**
 * Measure a delta in the mode the dimension declares.
 *
 * A relative comparison against a zero reference is not defined. It is NOT defaulted to 0 % (which would call a
 * movement from zero immaterial) and NOT defaulted to 100 % (which would call it critical regardless of size):
 * the measurement falls back to the absolute delta and says so, which keeps the threshold comparison honest and
 * the unit on the item correct.
 */
export function measureDelta(input: {
  readonly from: number | null;
  readonly to: number | null;
  readonly mode: ComparisonMode;
}): MeasuredDelta {
  const { from, to, mode } = input;
  if (mode === 'DECLARED') return { magnitude: 0, mode };
  if (from === null || to === null || !Number.isFinite(from) || !Number.isFinite(to)) {
    return { magnitude: 0, mode };
  }
  const absolute = to - from;
  switch (mode) {
    case 'RELATIVE_PCT':
      if (from === 0) return { magnitude: Math.abs(absolute), mode: 'ABSOLUTE' };
      return { magnitude: Math.abs(absolute / from) * 100, mode };
    case 'BASIS_POINTS':
      return { magnitude: Math.abs(absolute) * 10_000, mode };
    case 'PERCENTAGE_POINTS':
      return { magnitude: Math.abs(absolute) * 100, mode };
    case 'ABSOLUTE':
      return { magnitude: Math.abs(absolute), mode };
  }
}

/** Classify a measured magnitude against the policy's thresholds for its mode. */
export function classifyMagnitude(delta: MeasuredDelta, thresholds: Thresholds): MaterialityLevel {
  if (thresholds.mode === 'DECLARED') {
    throw new ReportValidationError('a declared dimension cannot be classified numerically', {});
  }
  if (delta.mode !== thresholds.mode) {
    // A fallback measurement (zero reference) is compared against absolute thresholds, not percentage ones.
    if (!(delta.mode === 'ABSOLUTE' && typeof thresholds.notable === 'number')) {
      throw new ReportValidationError('delta mode does not match the threshold policy', {
        deltaMode: delta.mode,
        thresholdMode: thresholds.mode,
      });
    }
  }
  const notable = thresholds.notable ?? Number.POSITIVE_INFINITY;
  const material = thresholds.material ?? Number.POSITIVE_INFINITY;
  const critical = thresholds.critical ?? Number.POSITIVE_INFINITY;
  // A fallback (zero-reference) delta is compared with the same numbers: they are then absolute units, which is
  // the only reading that cannot turn "moved away from zero" into "moved by a percentage of nothing".
  if (delta.magnitude >= critical) return 'CRITICAL';
  if (delta.magnitude >= material) return 'MATERIAL';
  if (delta.magnitude >= notable) return 'NOTABLE';
  return 'IMMATERIAL';
}

/** True when the delta is exactly zero in its own mode (no change at all, however small the noise). */
export function isZeroDelta(delta: MeasuredDelta): boolean {
  return delta.magnitude === 0;
}
