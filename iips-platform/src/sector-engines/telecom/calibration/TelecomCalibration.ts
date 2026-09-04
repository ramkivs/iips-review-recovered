/** Telecom Calibration Loader (WP-3) — loads frozen calibration profile (immutable, external). D16 M1-M15 preserved. */
import { deepFreeze } from '../../../infrastructure/deepFreeze';
import calibrationProfile from '../telecommunications-calibration-1.0.0.json';

export interface TelecomWeights {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface TelecomSegmentProfile {
  weights: TelecomWeights;
  leverageAlert: number;
}

export interface VerdictBand {
  min: number;
  max: number;
  verdict: string;
}

export interface TelecomCalibrationProfile {
  readonly profileId: string;
  readonly version: string;
  readonly bandScores: Readonly<Record<string, unknown[]>>;
  readonly segments: Readonly<Record<string, TelecomSegmentProfile>>;
  readonly weights?: Readonly<TelecomWeights>;
  readonly verdictMapping: readonly VerdictBand[];
}

export function loadTelecomCalibration(): TelecomCalibrationProfile {
  const p = calibrationProfile as unknown as {
    profile: string;
    version: string;
    bandScores: Record<string, unknown[]>;
    segments?: Record<string, TelecomSegmentProfile>;
    weights?: TelecomWeights;
    verdictMapping: VerdictBand[];
  };
  return deepFreeze({
    profileId: p.profile,
    version: p.version,
    bandScores: p.bandScores,
    segments: p.segments ?? {},
    weights: p.weights,
    verdictMapping: p.verdictMapping,
  });
}
