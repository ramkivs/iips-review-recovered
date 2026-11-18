/**
 * W05-E — issuer-level and portfolio-level lifecycle reporting.
 *
 * WHAT A READER SEES. Eligible holdings and distinct issuers; issuers with existing datasets;
 * issuers needing provisioning; qualified and unqualified datasets; rights unknown or restricted;
 * stale, incomplete and unavailable datasets; the financial periods covered; the accounting
 * limitations affecting analysis; and overall coverage percentages with EXPLICIT DENOMINATORS.
 *
 * WHAT A READER NEVER SEES. A hidden case. Duplicate holdings are never counted as separate issuer
 * datasets — coverage percentages are computed over DISTINCT ISSUERS and over ELIGIBLE HOLDINGS as
 * separate denominators, each labelled with its basis, and anything excluded from a denominator
 * (unresolved holdings, restricted use) is named beside it. Unresolved cases are never folded into
 * an aggregate.
 *
 * THRESHOLD STATUS. The report carries the qualification-threshold status verbatim: the mechanism
 * is in place and its proposal is documented, but no product-owner-approved threshold exists, so
 * "qualified" everywhere below means "meets the PROPOSED threshold technically" — never accepted
 * coverage. W05 stays IN PROGRESS until actual coverage and the threshold decision are evidenced.
 */
import type {
  IssuerCoverageRow,
  IssuerCoverageState,
  IssuerLifecycleResult,
  UnresolvedHolding,
} from './issuerLifecycle';

export interface CoveragePercentage {
  readonly id: string;
  readonly label: string;
  readonly numerator: number;
  readonly denominator: number;
  /** Which denominator this percentage is over. Never implicit. */
  readonly basis: 'DISTINCT_ISSUERS' | 'ELIGIBLE_HOLDINGS';
  /** 0–100, one decimal. Zero denominator yields 0 and is called out, not hidden. */
  readonly percent: number;
  /** What sits outside this denominator, named. Empty when nothing is excluded. */
  readonly excludes: string;
}

export interface PortfolioSummary {
  readonly portfolioId: string;
  readonly portfolioRevision: string;
  readonly totalHoldings: number;
  readonly eligibleHoldings: number;
  readonly unresolvedHoldings: number;
  readonly distinctIssuers: number;
  readonly issuersWithSuitableDataset: number;
  readonly issuersNeedingProvisioning: number;
}

export interface LifecycleReport {
  readonly generatedAt: string;
  readonly asOf: string;
  readonly thresholdStatus: 'PROPOSED_NOT_APPROVED';
  readonly thresholdNote: string;
  readonly denominators: {
    readonly totalHoldings: number;
    readonly eligibleHoldings: number;
    readonly distinctIssuers: number;
    readonly unresolvedHoldings: number;
  };
  readonly counts: {
    readonly issuersWithExistingDataset: number;
    readonly issuersNeedingProvisioning: number;
    /** Meets every gate of the PROPOSED threshold. Not an approval. */
    readonly qualifiedDatasets: number;
    readonly unqualifiedDatasets: number;
    readonly rightsUnknown: number;
    readonly rightsRestricted: number;
    readonly stale: number;
    readonly incomplete: number;
    readonly unavailable: number;
    readonly missing: number;
  };
  readonly periodsCovered: {
    readonly issuersWithAnnualPeriods: number;
    readonly issuersWithQuarterlyPeriods: number;
    readonly issuersWithTtm: number;
  };
  readonly accountingLimitations: readonly { readonly issuerId: string; readonly code: string; readonly severity: string }[];
  readonly coveragePercentages: readonly CoveragePercentage[];
  readonly portfolioSummaries: readonly PortfolioSummary[];
  readonly issuers: readonly IssuerCoverageRow[];
  readonly unresolved: readonly UnresolvedHolding[];
  readonly notes: readonly string[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(1));
}

function hasState(row: IssuerCoverageRow, state: IssuerCoverageState): boolean {
  return row.states.includes(state);
}

/**
 * Build the report from a completed lifecycle run. Pure: the same lifecycle result always
 * produces the same report.
 */
export function buildLifecycleReport(lifecycle: IssuerLifecycleResult, generatedAt: string): LifecycleReport {
  const rows = lifecycle.issuers;
  const distinctIssuers = rows.length;
  const eligibleHoldings = lifecycle.eligibleHoldings;

  const issuersWithExistingDataset = rows.filter((row) => row.candidates.length > 0).length;
  const issuersNeedingProvisioning = rows.filter((row) => row.provisioning !== null).length;
  const qualifiedDatasets = rows.filter(
    (row) => row.qualification !== null && row.qualification.failedGates.length === 0,
  ).length;
  const unqualifiedDatasets = rows.filter((row) => row.qualification !== null && row.qualification.failedGates.length > 0).length;

  const holdingsWithSuitableDataset = rows
    .filter((row) => row.selectedDatasetVersion !== null)
    .reduce((total, row) => total + row.holdings.length, 0);

  const coveragePercentages: readonly CoveragePercentage[] = [
    {
      id: 'issuer-dataset-coverage',
      label: 'Distinct issuers with an existing financial dataset',
      numerator: issuersWithExistingDataset,
      denominator: distinctIssuers,
      basis: 'DISTINCT_ISSUERS',
      percent: percent(issuersWithExistingDataset, distinctIssuers),
      excludes: lifecycle.unresolved.length === 0 ? '' : `${lifecycle.unresolved.length} unresolved holding(s) are outside this denominator; they name no issuer`,
    },
    {
      id: 'issuer-qualified-coverage',
      label: 'Distinct issuers whose dataset meets every gate of the PROPOSED (not approved) threshold',
      numerator: qualifiedDatasets,
      denominator: distinctIssuers,
      basis: 'DISTINCT_ISSUERS',
      percent: percent(qualifiedDatasets, distinctIssuers),
      excludes: 'nothing is excluded from the denominator; qualification itself is proposed, not approved (θF unestablished)',
    },
    {
      id: 'eligible-holding-coverage',
      label: 'Eligible holdings served by a suitable, reused issuer dataset',
      numerator: holdingsWithSuitableDataset,
      denominator: eligibleHoldings,
      basis: 'ELIGIBLE_HOLDINGS',
      percent: percent(holdingsWithSuitableDataset, eligibleHoldings),
      excludes: `${lifecycle.unresolved.length} unresolved holding(s) excluded from the eligible-holdings denominator`,
    },
  ];

  // Portfolio summaries are computed over DISTINCT issuers per portfolio: two holdings of the same
  // issuer in one portfolio are two holdings and ONE issuer, never two issuer datasets.
  interface PortfolioAccumulator {
    readonly portfolioId: string;
    portfolioRevision: string;
    totalHoldings: number;
    eligibleHoldings: number;
    unresolvedHoldings: number;
    readonly issuers: Set<string>;
    readonly issuersWithSuitableDataset: Set<string>;
    readonly issuersNeedingProvisioning: Set<string>;
  }
  const portfolioMap = new Map<string, PortfolioAccumulator>();
  const accumulatorFor = (portfolioId: string, portfolioRevision: string): PortfolioAccumulator => {
    const current = portfolioMap.get(portfolioId);
    if (current !== undefined) return current;
    const created: PortfolioAccumulator = {
      portfolioId,
      portfolioRevision,
      totalHoldings: 0,
      eligibleHoldings: 0,
      unresolvedHoldings: 0,
      issuers: new Set(),
      issuersWithSuitableDataset: new Set(),
      issuersNeedingProvisioning: new Set(),
    };
    portfolioMap.set(portfolioId, created);
    return created;
  };
  for (const row of rows) {
    for (const holding of row.holdings) {
      const accumulator = accumulatorFor(holding.portfolioId, holding.portfolioRevision);
      accumulator.totalHoldings += 1;
      accumulator.eligibleHoldings += 1;
      accumulator.issuers.add(row.issuerId);
      if (row.selectedDatasetVersion !== null) accumulator.issuersWithSuitableDataset.add(row.issuerId);
      if (row.provisioning !== null) accumulator.issuersNeedingProvisioning.add(row.issuerId);
    }
  }
  for (const holding of lifecycle.unresolved) {
    const accumulator = accumulatorFor(holding.portfolioId, holding.portfolioRevision);
    accumulator.totalHoldings += 1;
    accumulator.unresolvedHoldings += 1;
  }
  const portfolioSummaries: PortfolioSummary[] = [...portfolioMap.values()]
    .map((accumulator) => ({
      portfolioId: accumulator.portfolioId,
      portfolioRevision: accumulator.portfolioRevision,
      totalHoldings: accumulator.totalHoldings,
      eligibleHoldings: accumulator.eligibleHoldings,
      unresolvedHoldings: accumulator.unresolvedHoldings,
      distinctIssuers: accumulator.issuers.size,
      issuersWithSuitableDataset: accumulator.issuersWithSuitableDataset.size,
      issuersNeedingProvisioning: accumulator.issuersNeedingProvisioning.size,
    }))
    .sort((a, b) => (a.portfolioId < b.portfolioId ? -1 : 1));

  const notes = [...lifecycle.notes];
  notes.push(
    'every coverage percentage names its denominator basis; duplicate holdings of the same issuer share one issuer dataset and are never counted as separate datasets.',
  );
  notes.push(
    'W05 remains IN PROGRESS: the qualification threshold is a documented proposal awaiting product-owner approval and actual portfolio coverage is not verified by this report.',
  );

  return {
    generatedAt,
    asOf: lifecycle.asOf,
    thresholdStatus: 'PROPOSED_NOT_APPROVED',
    thresholdNote:
      'no product-owner-approved qualification threshold exists (θF unestablished); "qualified" means the dataset meets every gate of the documented PROPOSAL in lifecycle/threshold.ts, which is not an approval',
    denominators: {
      totalHoldings: lifecycle.totalHoldings,
      eligibleHoldings,
      distinctIssuers,
      unresolvedHoldings: lifecycle.unresolved.length,
    },
    counts: {
      issuersWithExistingDataset,
      issuersNeedingProvisioning,
      qualifiedDatasets,
      unqualifiedDatasets,
      rightsUnknown: rows.filter((row) => hasState(row, 'RIGHTS_UNKNOWN')).length,
      rightsRestricted: rows.filter((row) => hasState(row, 'RIGHTS_RESTRICTED')).length,
      stale: rows.filter((row) => hasState(row, 'STALE')).length,
      incomplete: rows.filter((row) => hasState(row, 'INCOMPLETE')).length,
      unavailable: rows.filter((row) => hasState(row, 'UNAVAILABLE')).length,
      missing: rows.filter((row) => hasState(row, 'MISSING')).length,
    },
    periodsCovered: {
      issuersWithAnnualPeriods: rows.filter((row) => (row.qualification?.periodsCovered.annual.length ?? 0) > 0).length,
      issuersWithQuarterlyPeriods: rows.filter((row) => (row.qualification?.periodsCovered.quarterly.length ?? 0) > 0).length,
      issuersWithTtm: rows.filter((row) => row.qualification?.periodsCovered.ttm != null).length,
    },
    accountingLimitations: rows.flatMap((row) =>
      (row.qualification?.accountingLimitations ?? []).map((finding) => ({
        issuerId: row.issuerId,
        code: finding.code,
        severity: finding.severity,
      })),
    ),
    coveragePercentages,
    portfolioSummaries,
    issuers: rows,
    unresolved: lifecycle.unresolved,
    notes,
  };
}

/** A plain-text summary for CLI/evidence use. Every line names its denominator where relevant. */
export function renderLifecycleSummary(report: LifecycleReport): string {
  const lines: string[] = [];
  lines.push(`W05 issuer-level financial-data lifecycle — as of ${report.asOf} (generated ${report.generatedAt})`);
  lines.push(`qualification threshold: ${report.thresholdStatus} — ${report.thresholdNote}`);
  lines.push(
    `holdings: ${report.denominators.totalHoldings} total, ${report.denominators.eligibleHoldings} eligible, ${report.denominators.unresolvedHoldings} unresolved; distinct issuers: ${report.denominators.distinctIssuers}`,
  );
  for (const coverage of report.coveragePercentages) {
    lines.push(
      `${coverage.id}: ${coverage.numerator}/${coverage.denominator} ${coverage.basis} = ${coverage.percent}%` +
        (coverage.excludes === '' ? '' : ` (excludes: ${coverage.excludes})`),
    );
  }
  lines.push(
    `issuers: ${report.counts.issuersWithExistingDataset} with a dataset, ${report.counts.issuersNeedingProvisioning} needing provisioning, ` +
      `${report.counts.qualifiedDatasets} qualified under the proposal, ${report.counts.unqualifiedDatasets} unqualified`,
  );
  lines.push(
    `distinct conditions: rights-unknown ${report.counts.rightsUnknown}, rights-restricted ${report.counts.rightsRestricted}, ` +
      `stale ${report.counts.stale}, incomplete ${report.counts.incomplete}, unavailable ${report.counts.unavailable}, missing ${report.counts.missing}`,
  );
  for (const note of report.notes) lines.push(`note: ${note}`);
  return lines.join('\n');
}
