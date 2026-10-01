/**
 * Cross-Sector Intelligence Engine — orchestrates the 7 CSIP core services.
 * Runs the deterministic execution pipeline (CSIP Execution Pipeline):
 *
 *   Ontology Mapper → Portfolio Intelligence → Ranking → Allocation → Diversification
 *   → Opportunity → Correlation → Evidence → Reporting
 *
 * Consumes ONLY normalized engine outputs (published). Never recomputes sector scores,
 * never reads engine internals. Deterministic + replay-identical.
 */
import { OntologyMapper, type EngineOutput } from './ontology/OntologyMapper';
import { PortfolioIntelligenceService } from './portfolio/PortfolioIntelligence';
import { RankingEngine } from './ranking/RankingEngine';
import { AllocationEngine, type Strategy } from './allocation/AllocationEngine';
import { DiversificationAnalyzer } from './diversification/DiversificationAnalyzer';
import { OpportunityEngine } from './opportunity/OpportunityEngine';
import { CorrelationEngine } from './correlation/CorrelationEngine';
import { ReportingEngine, type ReportType } from './reporting/ReportingEngine';
import { CrossSectorEvidenceBuilder, type CrossSectorEvidence } from './evidence/CrossSectorEvidence';
import { ScreeningPopulationGuard, type ScreeningPopulation } from './population/ScreeningPopulation';
import type { PortfolioIntelligenceReport, RankedOpportunity } from './types';

export interface PipelineInput {
  readonly portfolioId: string;
  readonly scenario: string;
  readonly strategy?: Strategy;
  readonly outputs: readonly EngineOutput[];
  readonly topN?: number;
  readonly reportTypes?: readonly ReportType[];
}

export interface PipelineResult {
  readonly portfolioId: string;
  readonly scenario: string;
  /** Governed Screening population identity and canonical member set (NP-12 G4/G5). */
  readonly population: {
    readonly identity: string;
    readonly members: ScreeningPopulation['members'];
  };
  readonly intelligence: PortfolioIntelligenceReport;
  readonly ranking: RankedOpportunity[];
  readonly allocation: ReturnType<AllocationEngine['recommend']>;
  readonly diversification: ReturnType<DiversificationAnalyzer['analyze']>;
  readonly opportunity: ReturnType<OpportunityEngine['top']>;
  readonly correlation: ReturnType<CorrelationEngine['analyze']>;
  readonly evidence: CrossSectorEvidence;
  readonly reports: ReturnType<ReportingEngine['build']>[];
}

export class CrossSectorEngine {
  private readonly ontology = new OntologyMapper();
  private readonly portfolio = new PortfolioIntelligenceService();
  private readonly ranking = new RankingEngine();
  private readonly allocation = new AllocationEngine();
  private readonly diversification = new DiversificationAnalyzer();
  private readonly opportunity = new OpportunityEngine();
  private readonly correlation = new CorrelationEngine();
  private readonly reporting = new ReportingEngine();
  private readonly evidence = new CrossSectorEvidenceBuilder();

  /** Run the full deterministic pipeline. */
  run(input: PipelineInput): PipelineResult {
    const { portfolioId, scenario, strategy = 'Balanced', outputs, topN = 10 } = input;

    // 1a. Governed Screening population boundary (NP-12 G1 → G2 → G3 → G5 → G4).
    //     Sector normalization, composite uniqueness, duplicate rejection, canonical
    //     ordering, and membership-only population identity all bind here, before any
    //     member reaches evaluation. Fail-closed: an invalid or duplicate population
    //     throws rather than being normalized, merged, or silently deduplicated.
    const population = ScreeningPopulationGuard.fromOutputs(outputs);

    // 1. Ontology Mapper — consumes the population with canonical sector spelling, in the
    //    caller's original input order. Canonical ordering is a population-identity concern
    //    and is deliberately NOT applied here: it is not the RankingEngine presentation order.
    const holdings = this.ontology.mapAll([...population.normalizedOutputs]);

    // 2. Portfolio Intelligence
    const intelligence = this.portfolio.compute(portfolioId, scenario, holdings);

    // 3. Cross-Sector Ranking
    const ranking = this.ranking.rank(holdings);

    // 4. Capital Allocation
    const allocation = this.allocation.recommend({ portfolioId, strategy, report: intelligence, holdings });

    // 6. Diversification
    const diversification = this.diversification.analyze(intelligence, holdings);

    // 7. Opportunity Detection
    const opportunity = this.opportunity.top(ranking, topN);

    // 8. Correlation
    const correlation = this.correlation.analyze(intelligence, holdings);

    // 9. Evidence
    const evidence = this.evidence.build(portfolioId, intelligence, ranking, allocation, diversification, correlation);

    // 10. Reporting
    const reportTypes = input.reportTypes ?? ['Executive', 'Portfolio Summary'];
    const reports = reportTypes.map((rt) =>
      this.reporting.build(rt, portfolioId, intelligence, ranking, allocation, diversification, opportunity, correlation),
    );

    return {
      portfolioId,
      scenario,
      population: { identity: population.identity, members: population.members },
      intelligence,
      ranking,
      allocation,
      diversification,
      opportunity,
      correlation,
      evidence,
      reports,
    };
  }
}
