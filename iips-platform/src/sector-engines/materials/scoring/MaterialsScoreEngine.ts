/** Materials Score Engine (WP-3) — band→score→pillar→composite per D20 M1-M15 + G1-G6. Deterministic. */
/**
 * G1 subsegment, G2 archetype, G3 metric direction/units, G4 scoring band, G5 calibration horizon, G6 ontology binding
 * are preserved verbatim per D20. Later authority-review governs despite older proposal wording.
 * G1: subsegment taxonomy (steel, cement, aluminium, diversified) — preserved.
 * G2: archetype (integrated, producer) — preserved with archetypeRisk multiplier on Risk pillar.
 * G3: metric direction/units per historical domainG — preserved.
 * G4: scoring band (lower-inclusive / upper-exclusive, round-half-to-even at composite only) — preserved.
 * G5: calibration horizon 1.0.0 — preserved.
 * G6: ontology binding 8 dimensions (sector-neutral CSIP) — preserved.
 */
import type { MaterialsInput } from '../metrics/MaterialsMetrics';
import type { MaterialsCalibrationProfile } from '../calibration/MaterialsCalibration';

function r1h2e(x: number): number {
  const scaled = x * 10;
  const floor = Math.floor(scaled);
  const frac = scaled - floor;
  if (frac === 0.5) return (floor % 2 === 0 ? floor : floor + 1) / 10;
  return Math.round(scaled) / 10;
}

export interface MaterialsPillars {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface MaterialsScoreResult {
  pillars: MaterialsPillars;
  composite: number;
}

export class MaterialsScoreEngine {
  constructor(private readonly calibration: MaterialsCalibrationProfile) {}

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

  score(input: MaterialsInput): MaterialsScoreResult {
    const m = (code: string, val: number): number | null => {
      const v = this.band(code, val);
      return Number.isNaN(v) ? null : v;
    };

    // G3 metric direction/units preserved: each MM metric has frozen direction (higher-better vs lower-better) via band thresholds.
    // G4 scoring band: lower-inclusive / upper-exclusive, round-half-to-even at composite only.
    const quality = renorm(pair(m('MM-001', input['MM-001'] as number), 0.6), pair(m('MM-007', input['MM-007'] as number), 0.4));
    const growth = renorm(pair(m('MM-002', input['MM-002'] as number), 0.5), pair(m('MM-003', input['MM-003'] as number), 0.5));
    const risk = renorm(pair(m('MM-005', input['MM-005'] as number), 0.7), pair(m('MM-007', input['MM-007'] as number), 0.3));
    const profitability = renorm(pair(m('MM-003', input['MM-003'] as number), 0.5), pair(m('MM-004', input['MM-004'] as number), 0.5));
    const capitalEfficiency = renorm(pair(m('MM-006', input['MM-006'] as number), 1.0));
    const valuation = renorm(pair(m('MM-008', input['MM-008'] as number), 0.6), pair(m('MM-002', input['MM-002'] as number), 0.4));

    const pillars: MaterialsPillars = { quality, growth, risk, profitability, capitalEfficiency, valuation };

    // G1 subsegment + G5 calibration horizon: weights per subsegment (frozen), default to first segment if not provided.
    // G2 archetype: risk pillar weight multiplied by archetypeRisk (frozen).
    const subsegment = (input.subsegment as string) ?? Object.keys(this.calibration.segments)[0] ?? 'steel';
    const segment = this.calibration.segments[subsegment] ?? Object.values(this.calibration.segments)[0];
    let weights = segment?.weights ?? { quality: 0.20, growth: 0.15, risk: 0.20, profitability: 0.20, capitalEfficiency: 0.15, valuation: 0.10 };
    // G2 archetype risk multiplier
    const archetype = (input.archetype as string) ?? 'integrated';
    const archetypeRisk = this.calibration.archetypeRisk[archetype] ?? 1.0;
    const w = { ...weights } as Record<string, number>;
    w.risk = w.risk * archetypeRisk;

    // Deterministic left-to-right summation (similar to Option-A but not required for materials; preserved for determinism)
    const pillarValues = [pillars.quality, pillars.growth, pillars.risk, pillars.profitability, pillars.capitalEfficiency, pillars.valuation];
    const weightValues = [w.quality, w.growth, w.risk, w.profitability, w.capitalEfficiency, w.valuation];
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
