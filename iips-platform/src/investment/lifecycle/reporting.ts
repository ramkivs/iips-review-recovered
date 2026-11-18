/**
 * W05-E — issuer-level and portfolio-level lifecycle reporting.
 *
 * WHAT A READER SEES. Eligible holdings and distinct issuers; issuers with existing datasets;
 * issuers needing provisioning; qualified and unqualified datasets; rights unknown or restricted;
 * stale, incomplete and unavailable datasets; the financial periods covered; the accounting
 * limitations affecting analysis; and overall coverage percentages with EXPLICIT DENOMINATORS —
 * reported BY ISSUER, BY SECTOR and BY ACQUISITION METHOD (authoritative roadmap reconciliation
 * 2026-11-17), not by issuer alone.
 *
 * WHAT A READER NEVER SEES. A hidden case. Duplicate holdings are never counted as separate issuer
 * datasets — coverage percentages are computed over DISTINCT ISSUERS and over ELIGIBLE HOLDINGS as
 * separate denominators, each labelled with its basis, and anything excluded from a denominator
 * (unresolved holdings, restricted use) is named beside it. Unresolved cases are never folded into
 * an aggregate.
 *
 * THE FINANCIAL RATIO. The portfolio-wide financial ratio θF gates on is reported here with its
 * rule on the face of the output: a holding contributes to the numerator ONLY IF ITS OWN IDENTITY
 * PASSES. Unresolved holdings never contribute; the denominator is the portfolio holding count
 * (the W04 revision for IIPS coverage).
 *
 * θF STATUS. The report carries θF's standing verbatim: θF is the PORTFOLIO-WIDE ratio that gates
 * W20 — not a per-dataset qualification threshold and not a W05 condition. It is set from observed
 * evidence under the standing grant; no defensible value can yet be asserted, so none is asserted
 * and the W20 gate is reported CLOSED (fail closed). "Qualified" everywhere below means "meets
 * every gate of the per-dataset technical ruleset" — never accepted coverage. W05 stays IN
 * PROGRESS — NOT ACCEPTED until actual coverage is evidenced.
 */
import type {
  IssuerCoverageRow,
  IssuerCoverageState,
  IssuerLifecycleResult,
  UnresolvedHolding,
} from './issuerLifecycle';
import {
  THETA_F,
  evaluateW20Gate,
  financialRatio,
  type FinancialRatio,
  type PortfolioRatioThreshold,
} from './threshold';

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

/**
 * One entry of a coverage-dimension breakdown. W05 requires coverage BY SECTOR and BY ACQUISITION
 * METHOD alongside the by-issuer figures; every entry names what it counts.
 */
export interface CoverageDimensionEntry {
  readonly key: string;
  readonly basis: 'SECTOR' | 'ACQUISITION_METHOD';
  readonly issuers: number;
  readonly holdings: number;
  readonly holdingsWithFinancialData: number;
  /** 0–100 over the entry's own holdings. */
  readonly percent: number;
  readonly note: string;
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
  /**
   * θF's standing, verbatim. The portfolio-wide ratio that gates W20 — not a per-dataset
   * qualification threshold, not a W05 condition, no approval dependency.
   */
  readonly thetaF: PortfolioRatioThreshold & {
    readonly w20GateOpen: boolean;
    readonly w20GateReason: string;
  };
  /** The portfolio-wide financial ratio θF gates on, with its identity rule on the face of it. */
  readonly financialRatio: FinancialRatio;
  readonly denominators: {
    readonly totalHoldings: number;
    readonly eligibleHoldings: number;
    readonly distinctIssuers: number;
    readonly unresolvedHoldings: number;
  };
  readonly counts: {
    readonly issuersWithExistingDataset: number;
    readonly issuersNeedingProvisioning: number;
    /** Meets every gate of the per-dataset technical ruleset. Not θF. Not an approval. */
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
  /** Coverage BY SECTOR, alongside the by-issuer figures. */
  readonly coverageBySector: readonly CoverageDimensionEntry[];
  /** Coverage BY ACQUISITION METHOD, alongside the by-issuer figures. */
  readonly coverageByAcquisitionMethod: readonly CoverageDimensionEntry[];
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

/** The sector as the issuer's dataset records it; 'UNSPECIFIED' when no dataset records one. */
function sectorOfRow(row: IssuerCoverageRow): string {
  return row.qualification?.metricCompleteness.sector ?? row.candidates[0]?.qualification.metricCompleteness.sector ?? 'UNSPECIFIED';
}

/** The recorded acquisition method of the issuer's dataset; 'NOT_PROVISIONED' when none exists. */
function acquisitionMethodOfRow(row: IssuerCoverageRow): string {
  const selected = row.candidates.find((candidate) => candidate.datasetVersion === row.selectedDatasetVersion) ?? row.candidates[0];
  return selected?.qualification.evidence.rights.acquisitionMethod ?? 'NOT_PROVISIONED';
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

  const holdingsWithFinancialData = rows
    .filter((row) => row.selectedDatasetVersion !== null)
    .reduce((total, row) => total + row.holdings.length, 0);

  // The financial ratio θF gates on. The rule is enforced by construction: only identity-passed
  // holdings reach the rows above (unresolved holdings are itemised separately and never
  // contribute), and `financialRatio` refuses inputs that would violate it.
  const ratio = financialRatio({
    identityPassedHoldings: eligibleHoldings,
    holdingsWithFinancialData,
    totalHoldings: lifecycle.totalHoldings,
  });
  const w20 = evaluateW20Gate(ratio);

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
      label: 'Distinct issuers whose dataset meets every gate of the per-dataset qualification ruleset (technical; not θF)',
      numerator: qualifiedDatasets,
      denominator: distinctIssuers,
      basis: 'DISTINCT_ISSUERS',
      percent: percent(qualifiedDatasets, distinctIssuers),
      excludes:
        'nothing is excluded from the denominator; the ruleset is a per-dataset technical mechanism, and θF is the separate portfolio-wide ratio that gates W20 with no defensible value asserted',
    },
    {
      id: 'eligible-holding-coverage',
      label: 'Eligible holdings served by a suitable, reused issuer dataset',
      numerator: holdingsWithFinancialData,
      denominator: eligibleHoldings,
      basis: 'ELIGIBLE_HOLDINGS',
      percent: percent(holdingsWithFinancialData, eligibleHoldings),
      excludes: `${lifecycle.unresolved.length} unresolved holding(s) excluded from the eligible-holdings denominator`,
    },
  ];

  // Coverage BY SECTOR and BY ACQUISITION METHOD, alongside the by-issuer figures. Unresolved
  // holdings fail identity and therefore sit outside every dimension entry — they are itemised in
  // `unresolved`, never folded into an aggregate.
  interface DimensionAccumulator {
    issuers: number;
    holdings: number;
    holdingsWithFinancialData: number;
  }
  const buildDimension = (
    basis: 'SECTOR' | 'ACQUISITION_METHOD',
    keyOf: (row: IssuerCoverageRow) => string,
    noteFor: (key: string) => string,
  ): readonly CoverageDimensionEntry[] => {
    const acc = new Map<string, DimensionAccumulator>();
    for (const row of rows) {
      const key = keyOf(row);
      const entry = acc.get(key) ?? { issuers: 0, holdings: 0, holdingsWithFinancialData: 0 };
      entry.issuers += 1;
      entry.holdings += row.holdings.length;
      if (row.selectedDatasetVersion !== null) entry.holdingsWithFinancialData += row.holdings.length;
      acc.set(key, entry);
    }
    return [...acc.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([key, entry]) => ({
        key,
        basis,
        issuers: entry.issuers,
        holdings: entry.holdings,
        holdingsWithFinancialData: entry.holdingsWithFinancialData,
        percent: percent(entry.holdingsWithFinancialData, entry.holdings),
        note: noteFor(key),
      }));
  };
  const coverageBySector = buildDimension(
    'SECTOR',
    sectorOfRow,
    (key) =>
      key === 'UNSPECIFIED'
        ? 'no dataset records a governed sector for these issuers; holdings failing identity are outside every sector entry and are itemised under `unresolved`'
        : 'sector as recorded by the issuer dataset; holdings failing identity are outside every sector entry and are itemised under `unresolved`',
  );
  const coverageByAcquisitionMethod = buildDimension(
    'ACQUISITION_METHOD',
    acquisitionMethodOfRow,
    (key) =>
      key === 'NOT_PROVISIONED'
        ? 'no dataset provisioned for these issuers yet; acquisition method is recorded per dataset (lifecycle/rightsRecord.ts) and provisioned coverage will appear under its method'
        : 'acquisition method as recorded in the dataset rights record; holdings failing identity are outside every method entry and are itemised under `unresolved`',
  );

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
    'a holding contributes to the financial ratio only if its own identity passes; unresolved holdings never contribute and are itemised under `unresolved`.',
  );
  notes.push(
    'coverage is reported by issuer, by sector and by acquisition method; dimension entries cover identity-passed holdings only.',
  );
  notes.push(
    'W05 remains IN PROGRESS — NOT ACCEPTED: actual portfolio coverage is not established by this report, and the required-metric set is provisional pending W10. θF is the portfolio-wide ratio that gates W20 and is NOT a W05 condition.',
  );

  return {
    generatedAt,
    asOf: lifecycle.asOf,
    thetaF: {
      ...THETA_F,
      w20GateOpen: w20.open,
      w20GateReason: w20.reason,
    },
    financialRatio: ratio,
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
    coverageBySector,
    coverageByAcquisitionMethod,
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
  lines.push(
    `θF (portfolio-wide ratio, gates W20 — not a W05 condition): ${report.thetaF.assertionStatus} — ${report.thetaF.note}`,
  );
  lines.push(`W20 gate: ${report.thetaF.w20GateOpen ? 'OPEN' : 'CLOSED'} — ${report.thetaF.w20GateReason}`);
  lines.push(
    `financial ratio: ${report.financialRatio.numerator}/${report.financialRatio.denominator} = ${report.financialRatio.percent}% ` +
      `(identity-passed holdings: ${report.financialRatio.identityPassedHoldings}; rule: ${report.financialRatio.numeratorRule})`,
  );
  lines.push(
    `holdings: ${report.denominators.totalHoldings} total, ${report.denominators.eligibleHoldings} eligible, ${report.denominators.unresolvedHoldings} unresolved; distinct issuers: ${report.denominators.distinctIssuers}`,
  );
  for (const coverage of report.coveragePercentages) {
    lines.push(
      `${coverage.id}: ${coverage.numerator}/${coverage.denominator} ${coverage.basis} = ${coverage.percent}%` +
        (coverage.excludes === '' ? '' : ` (excludes: ${coverage.excludes})`),
    );
  }
  for (const entry of report.coverageBySector) {
    lines.push(`coverage by sector [${entry.key}]: ${entry.holdingsWithFinancialData}/${entry.holdings} holdings = ${entry.percent}%`);
  }
  for (const entry of report.coverageByAcquisitionMethod) {
    lines.push(
      `coverage by acquisition method [${entry.key}]: ${entry.holdingsWithFinancialData}/${entry.holdings} holdings = ${entry.percent}%`,
    );
  }
  lines.push(
    `issuers: ${report.counts.issuersWithExistingDataset} with a dataset, ${report.counts.issuersNeedingProvisioning} needing provisioning, ` +
      `${report.counts.qualifiedDatasets} qualified under the per-dataset ruleset, ${report.counts.unqualifiedDatasets} unqualified`,
  );
  lines.push(
    `distinct conditions: rights-unknown ${report.counts.rightsUnknown}, rights-restricted ${report.counts.rightsRestricted}, ` +
      `stale ${report.counts.stale}, incomplete ${report.counts.incomplete}, unavailable ${report.counts.unavailable}, missing ${report.counts.missing}`,
  );
  for (const note of report.notes) lines.push(`note: ${note}`);
  return lines.join('\n');
}
