/** Auto Score Engine (WP-3) — band→score→pillar→composite per D17 M1-M15 + Option-A. Deterministic. */
/**
 * IES-017 Option-A corrected left-to-right summation oracle — preserved verbatim.
 * Composite summation uses explicit left-to-right for-loop (not Array.reduce sum() or lodash sum).
 * This is the frozen Option-A oracle: generator 44ba141957eb78654bce0fe3320a709a812291f35b5b7b6a5f342bfe54f27a25,
 * expected ea22807925694aa3e2b97cd2f1b1990cc4235e4e19023b31ae43bdc55314d81d,
 * replay c8ed26c58dc6d2f7db71caa4d8d959cae843ddff0b9dd4e072856ed2e952428f — no sum() substitution.
 */
import type { AutoInput } from '../metrics/AutoMetrics';
import type { AutoCalibrationProfile } from '../calibration/AutoCalibration';

function r1h2e(x: number): number {
  const scaled = x * 10;
  const floor = Math.floor(scaled);
  const frac = scaled - floor;
  if (frac === 0.5) return (floor % 2 === 0 ? floor : floor + 1) / 10;
  return Math.round(scaled) / 10;
}

export interface AutoPillars {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface AutoScoreResult {
  pillars: AutoPillars;
  composite: number;
}

export class AutoScoreEngine {
  constructor(private readonly calibration: AutoCalibrationProfile) {}

  band(metricId: string, value: number | null | undefined): number {
    if (value === null || value === undefined) return Number.NaN;
    const bands = this.calibration.bandScores[metricId] as unknown as Array<string | number>[];
    for (const b of bands) {
      const op = b[0] as string;
      if (op === 'lt' && value < (b[1] as number)) return b[2] as number;
      if (op === 'gte' && value >= (b[1] as number)) return b[2] as number;
      if (op === 'gt' && value > (b[1] as number)) return b[2] as number;
      if (op === 'range' && value >= (b[1] as number) && value < (b[2] as number)) return b[3] as number;
      if (op === 'range_inc' && value >= (b[1] as number) && value <= (b[2] as number)) return b[3] as number;
    }
    throw new Error(`no band for ${metricId} value ${value}`);
  }

  score(input: AutoInput): AutoScoreResult {
    const m = (code: string, val: number): number | null => {
      const v = this.band(code, val);
      return Number.isNaN(v) ? null : v;
    };

    // Pillar composition per D17 M1-M15 (frozen) — same isolation as telecom but with auto metrics
    const quality = renorm(pair(m('AU-001', input['AU-001'] as number), 0.5), pair(m('AU-005', input['AU-005'] as number), 0.5));
    const growth = renorm(pair(m('AU-002', input['AU-002'] as number), 0.5), pair(m('AU-003', input['AU-003'] as number), 0.5));
    const risk = renorm(pair(m('AU-008', input['AU-008'] as number), 0.6), pair(m('AU-006', input['AU-006'] as number), 0.4));
    const profitability = renorm(pair(m('AU-004', input['AU-004'] as number), 0.6), pair(m('AU-007', input['AU-007'] as number), 0.4));
    const capitalEfficiency = renorm(pair(m('AU-006', input['AU-006'] as number), 1.0));
    const valuation = renorm(pair(m('AU-008', input['AU-008'] as number), 0.5), pair(m('AU-001', input['AU-001'] as number), 0.5));

    const pillars: AutoPillars = { quality, growth, risk, profitability, capitalEfficiency, valuation };

    // Composite: frozen pillar weights — deterministic left-to-right summation (Option-A)
    let weights: { quality: number; growth: number; risk: number; profitability: number; capitalEfficiency: number; valuation: number };
    if (this.calibration.weights) {
      weights = this.calibration.weights as AutoWeights;
    } else {
      const segKey = (input as any).segment ?? Object.keys(this.calibration.segments)[0] ?? 'default';
      const seg = (this.calibration.segments as any)[segKey] ?? (this.calibration.segments as any)['default'] ?? Object.values(this.calibration.segments)[0];
      if (seg && seg.weights) weights = seg.weights;
      else weights = { quality: 0.20, growth: 0.15, risk: 0.20, profitability: 0.25, capitalEfficiency: 0.10, valuation: 0.10 };
    }

    // Option-A left-to-right summation — explicit for-loop, not sum()
    const pillarValues = [pillars.quality, pillars.growth, pillars.risk, pillars.profitability, pillars.capitalEfficiency, pillars.valuation];
    const weightValues = [weights.quality, weights.growth, weights.risk, weights.profitability, weights.capitalEfficiency, weights.valuation];
    let compositeRaw = 0;
    // Explicit left-to-right for-loop (Option-A preserved verbatim — no sum() substitution)
    for (let i = 0; i < pillarValues.length; i++) {
      compositeRaw += pillarValues[i] * weightValues[i];
    }
    const composite = r1h2e(compositeRaw);

    return { pillars, composite };
  }
}

function pair(score: number | null, weight: number): [number, number] | null {
  return score === null ? null : [score, weight];
}

function renorm(...items: Array<[number, number] | null>): number {
  const avail = items.filter((x): x is [number, number] => x !== null);
  if (avail.length === 0) return 0;
  const wsum = avail.reduce((a, [, w]) => a + w, 0);
  return avail.reduce((a, [s, w]) => a + s * w, 0) / wsum;
}

type AutoWeights = { quality: number; growth: number; risk: number; profitability: number; capitalEfficiency: number; valuation: number };
