/** Telecom Decision Engine (WP-3) — composite→verdict + overrides per D16 M1-M15 (frozen). */
import type { TelecomCalibrationProfile } from '../calibration/TelecomCalibration';

export interface DecisionInput {
  composite: number;
  debtEbitda?: number;
  governance?: boolean;
  regulatoryShock?: boolean;
  networkOutage?: boolean;
}

export interface DecisionResult {
  verdict: string;
  composite: number;
  overridesApplied: string[];
}

const CAP_RANK: Record<string, number> = { 'Strong Buy': 6, Buy: 5, Accumulate: 4, Hold: 3, Watch: 2, Avoid: 1 };

export class TelecomDecision {
  constructor(private readonly calibration: TelecomCalibrationProfile) {}

  decide(input: DecisionInput): DecisionResult {
    let verdict = this.verdictFor(input.composite);
    const overridesApplied: string[] = [];
    const cap = (v: string, vcap: string): string => (CAP_RANK[v] > CAP_RANK[vcap] ? vcap : v);

    // Precedence: governance → regulatory shock → network outage → leverage
    if (input.governance) {
      verdict = cap(verdict, 'Avoid');
      overridesApplied.push('governance');
    }
    if (input.regulatoryShock) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('regulatory-shock');
    }
    if (input.networkOutage) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('network-outage');
    }
    // Leverage alert from calibration segments (default leverageAlert)
    const alert = this.getLeverageAlert();
    if (input.debtEbitda !== undefined && input.debtEbitda > alert) {
      verdict = cap(verdict, 'Watch');
      overridesApplied.push('leverage-alert');
    }

    return { verdict, composite: input.composite, overridesApplied };
  }

  private getLeverageAlert(): number {
    if (this.calibration.segments) {
      const first = Object.values(this.calibration.segments)[0] as any;
      if (first?.leverageAlert) return first.leverageAlert;
    }
    return 3.5;
  }

  private verdictFor(composite: number): string {
    for (const b of this.calibration.verdictMapping) {
      if (composite >= b.min && composite < b.max) return b.verdict;
      // terminal includes upper bound (consistent with replay)
      if (composite === 100 && b.max === 100) return b.verdict;
    }
    // Fallback lower-inclusive/upper-exclusive with terminal inclusive
    for (const b of this.calibration.verdictMapping) {
      if (composite >= b.min && composite <= b.max) return b.verdict;
    }
    return 'Avoid';
  }
}
