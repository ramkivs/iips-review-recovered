/** Telecom Evidence (WP-3) — evidence packages per D11. Reuses EvidencePipeline. */
import type { EvidencePipeline, EvidencePackage } from '../../../framework/evidence/EvidencePipeline';
import type { TelecomScoreResult } from '../scoring/TelecomScoreEngine';
import type { DecisionResult } from '../decision/TelecomDecision';

export interface TelecomEvidenceInput {
  decision: DecisionResult;
  score: TelecomScoreResult;
  calibrationVersion: string;
  snapshotId: string;
}

export class TelecomEvidence {
  constructor(private readonly pipeline: EvidencePipeline) {}

  build(input: TelecomEvidenceInput): Readonly<EvidencePackage> {
    return this.pipeline.build({
      engineId: 'sector.telecom',
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
        methodologyVersion: 'IES-016 v1.0',
        snapshotId: input.snapshotId,
      },
    });
  }
}
