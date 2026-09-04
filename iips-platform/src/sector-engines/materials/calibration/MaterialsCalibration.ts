/** Materials Calibration Loader (WP-3) — loads frozen calibration profile (immutable, external). D20 M1-M15 + G1-G6 preserved. */
import { deepFreeze } from '../../../infrastructure/deepFreeze';
import calibrationProfile from '../materials-metals-calibration-1.0.0.json';

export interface MaterialsWeights {
  quality: number;
  growth: number;
  risk: number;
  profitability: number;
  capitalEfficiency: number;
  valuation: number;
}

export interface MaterialsSegmentProfile {
  weights: MaterialsWeights;
  leverageAlert: number;
}

export interface VerdictBand {
  min: number;
  max: number;
  verdict: string;
}

export interface MaterialsCalibrationProfile {
  readonly profileId: string;
  readonly version: string;
  readonly bandScores: Readonly<Record<string, unknown[]>>;
  readonly segments: Readonly<Record<string, MaterialsSegmentProfile>>;
  readonly archetypeRisk: Readonly<Record<string, number>>;
  readonly weights?: Readonly<MaterialsWeights>;
  readonly verdictMapping: readonly VerdictBand[];
  readonly ontologyDimensions: number;
}

export function loadMaterialsCalibration(): MaterialsCalibrationProfile {
  const p = calibrationProfile as unknown as {
    profile: string;
    version: string;
    bandScores: Record<string, unknown[]>;
    segments: Record<string, MaterialsSegmentProfile>;
    archetypeRisk: Record<string, number>;
    weights?: MaterialsWeights;
    verdictMapping: VerdictBand[];
    ontologyDimensions?: number;
  };
  return deepFreeze({
    profileId: p.profile,
    version: p.version,
    bandScores: p.bandScores,
    segments: p.segments ?? {},
    archetypeRisk: p.archetypeRisk ?? {},
    weights: p.weights,
    verdictMapping: p.verdictMapping,
    ontologyDimensions: p.ontologyDimensions ?? 8,
  });
}
