/** Auto Evidence (WP-3) — evidence packages per D11. Reuses EvidencePipeline. */
import type { EvidencePipeline, EvidencePackage } from '../../../framework/evidence/EvidencePipeline';
import type { AutoScoreResult } from '../scoring/AutoScoreEngine';
import type { DecisionResult } from '../decision/AutoDecision';

export interface AutoEvidenceInput {
  decision: DecisionResult;
  score: AutoScoreResult;
  calibrationVersion: string;
  snapshotId: string;
}

export class AutoEvidence {
  constructor(private readonly pipeline: EvidencePipeline) {}

  build(input: AutoEvidenceInput): Readonly<EvidencePackage> {
    return this.pipeline.build({
      engineId: 'sector.auto',
      recommendation: input.decision.verdict,
      compositeScore: input.score.composite,
      confidence: 0.8,
      supportingScores: [
        { id: 'quality', name: 'Quality', value: input.score.pillars.quality },
        { id: 'growth', name: 'Growth', value: input.score.pillars.growth },
        { id: 'risk', name: 'Risk', value: input.score.pillars.risk },
        { id: 'profitability', name: 'Profitability', value: input.score.pillars.profitability },
      ],
      decisionRulesApplied: input.decision.overridesApplied,
      calibrationVersion: input.calibrationVersion,
      replayReference: input.snapshotId,
      provenance: {
        frameworkVersion: '1.0',
        engineVersion: '1.0.0',
        methodologyVersion: 'IES-017 v1.0 (Option-A left-to-right)',
        snapshotId: input.snapshotId,
      },
    });
  }
}
