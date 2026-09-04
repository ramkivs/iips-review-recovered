/** Materials Decision Engine (WP-3) — composite→verdict + overrides per D20 M1-M15 + G1-G6 (frozen). */
import type { MaterialsCalibrationProfile } from '../calibration/MaterialsCalibration';

export interface DecisionInput {
  composite: number;
  subsegment?: string;
  debtEbitda?: number;
  governance?: boolean;
  commodityShock?: boolean;
  operationalDisruption?: boolean;
}

export interface DecisionResult {
  verdict: string;
  composite: number;
  overridesApplied: string[];
}

const CAP_RANK: Record<string, number> = { 'Strong Buy': 6, Buy: 5, Accumulate: 4, Hold: 3, Watch: 2, Avoid: 1 };

export class MaterialsDecision {
  constructor(private readonly calibration: MaterialsCalibrationProfile) {}

  decide(input: DecisionInput): DecisionResult {
    let verdict = this.verdictFor(input.composite);
    const overridesApplied: string[] = [];
    const cap = (v: string, vcap: string): string => (CAP_RANK[v] > CAP_RANK[vcap] ? vcap : v);

    if (input.governance) {
      verdict = cap(verdict, 'Avoid');
      overridesApplied.push('governance');
    }
    if (input.commodityShock) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('commodity-shock');
    }
    if (input.operationalDisruption) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('operational-disruption');
    }
    const alert = this.getLeverageAlert(input.subsegment);
    if (input.debtEbitda !== undefined && input.debtEbitda > alert) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('leverage-alert');
    }

    return { verdict, composite: input.composite, overridesApplied };
  }

  private getLeverageAlert(subsegment?: string): number {
    const seg = subsegment ? this.calibration.segments[subsegment] : undefined;
    if (seg?.leverageAlert) return seg.leverageAlert;
    const first = Object.values(this.calibration.segments)[0] as any;
    if (first?.leverageAlert) return first.leverageAlert;
    return 3.5;
  }

  private verdictFor(composite: number): string {
    for (const b of this.calibration.verdictMapping) {
      if (composite >= b.min && composite < b.max) return b.verdict;
      if (composite === 100 && b.max === 100) return b.verdict;
    }
    for (const b of this.calibration.verdictMapping) {
      if (composite >= b.min && composite <= b.max) return b.verdict;
    }
    return 'Avoid';
  }
}
