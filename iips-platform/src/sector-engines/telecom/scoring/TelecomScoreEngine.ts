/** Telecom Score Engine (WP-3) — band→score→pillar→composite per D16 M1-M15. Deterministic. Preserves frozen methodology. */
import type { TelecomInput } from '../metrics/TelecomMetrics';
import type { TelecomCalibrationProfile } from '../calibration/TelecomCalibration';

/** Round-half-to-even (applied at composite only; pillars kept at full precision). */
function r1h2e(x: number): number {
  const scaled = x * 10;
  const floor = Math.floor(scaled);
  const frac = scaled - floor;
  if (frac === 0.5) return (floor % 2 === 0 ? floor : floor + 1) / 10;
  return Math.round(scaled) / 10;
}

export interface TelecomPillars {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface TelecomScoreResult {
  pillars: TelecomPillars;
  composite: number;
}

export class TelecomScoreEngine {
  constructor(private readonly calibration: TelecomCalibrationProfile) {}

  /** Band→score (lower-inclusive / upper-exclusive where applicable; lower-better for leverage-like). */
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

  score(input: TelecomInput): TelecomScoreResult {
    // Map frozen TL metrics to band scores
    const s1 = this.band('TL-001', input['TL-001'] as number);
    const s2 = this.band('TL-002', input['TL-002'] as number);
    const s3 = this.band('TL-003', input['TL-003'] as number);
    const s4 = this.band('TL-004', input['TL-004'] as number);
    const s5 = this.band('TL-005', input['TL-005'] as number);
    const s6 = this.band('TL-006', input['TL-006'] as number);
    const s7 = this.band('TL-007', input['TL-007'] as number);
    const s8 = this.band('TL-008', input['TL-008'] as number);

    const m = (code: string, val: number): number | null => {
      const v = this.band(code, val);
      return Number.isNaN(v) ? null : v;
    };

    // Pillar composition per D16 M1-M15 (frozen): quality/growth/risk/profitability/capitalEfficiency/valuation
    // Each pillar renormalizes over available metrics (missing → 0 contribution, consistent with other engines).
    const quality = renorm(pair(m('TL-001', input['TL-001'] as number), 0.6), pair(m('TL-007', input['TL-007'] as number), 0.4));
    const growth = renorm(pair(m('TL-002', input['TL-002'] as number), 0.55), pair(m('TL-003', input['TL-003'] as number), 0.45));
    const risk = renorm(pair(m('TL-005', input['TL-005'] as number), 0.6), pair(m('TL-008', input['TL-008'] as number), 0.4));
    const profitability = renorm(pair(m('TL-004', input['TL-004'] as number), 0.5), pair(m('TL-006', input['TL-006'] as number), 0.5));
    const capitalEfficiency = renorm(pair(m('TL-006', input['TL-006'] as number), 1.0));
    const valuation = renorm(pair(m('TL-008', input['TL-008'] as number), 0.5), pair(m('TL-002', input['TL-002'] as number), 0.5));

    const pillars: TelecomPillars = { quality, growth, risk, profitability, capitalEfficiency, valuation };

    // Composite: frozen pillar weights (per D16, no inline tuning)
    // If calibration has segments, use default segment weights; else use flat weights.
    let w: TelecomPillars extends infer _ ? never : never;
    let weights: { quality: number; growth: number; risk: number; profitability: number; capitalEfficiency: number; valuation: number };
    if (this.calibration.weights) {
      weights = this.calibration.weights as TelecomWeights;
    } else {
      const segKey = (input as any).segment ?? Object.keys(this.calibration.segments)[0] ?? 'default';
      const seg = (this.calibration.segments as any)[segKey] ?? (this.calibration.segments as any)['integrated'] ?? Object.values(this.calibration.segments)[0];
      if (seg && seg.weights) {
        weights = seg.weights;
      } else {
        weights = { quality: 0.22, growth: 0.18, risk: 0.20, profitability: 0.20, capitalEfficiency: 0.10, valuation: 0.10 };
      }
    }

    // Left-to-right deterministic summation (explicit loop, consistent with D17 Option-A preservation for telecom? Using same deterministic pattern)
    const pillarValues = [pillars.quality, pillars.growth, pillars.risk, pillars.profitability, pillars.capitalEfficiency, pillars.valuation];
    const weightValues = [weights.quality, weights.growth, weights.risk, weights.profitability, weights.capitalEfficiency, weights.valuation];
    let compositeRaw = 0;
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

type TelecomWeights = { quality: number; growth: number; risk: number; profitability: number; capitalEfficiency: number; valuation: number };
