/** Auto Calibration Loader (WP-3) — loads frozen calibration profile (immutable, external). D17 M1-M15 + Option-A preserved. */
import { deepFreeze } from '../../../infrastructure/deepFreeze';
import calibrationProfile from '../automobile-calibration-1.0.0.json';

export interface AutoWeights {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface AutoSegmentProfile {
  weights: AutoWeights;
  leverageAlert: number;
}

export interface VerdictBand {
  min: number;
  max: number;
  verdict: string;
}

export interface AutoCalibrationProfile {
  readonly profileId: string;
  readonly version: string;
  readonly bandScores: Readonly<Record<string, unknown[]>>;
  readonly segments: Readonly<Record<string, AutoSegmentProfile>>;
  readonly weights?: Readonly<AutoWeights>;
  readonly verdictMapping: readonly VerdictBand[];
}

export function loadAutoCalibration(): AutoCalibrationProfile {
  const p = calibrationProfile as unknown as {
    profile: string;
    version: string;
    bandScores: Record<string, unknown[]>;
    segments?: Record<string, AutoSegmentProfile>;
    weights?: AutoWeights;
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
