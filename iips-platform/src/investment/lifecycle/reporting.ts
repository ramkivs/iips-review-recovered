/**
 * W05-E — issuer-level and portfolio-level lifecycle reporting.
 *
 * WHAT A READER SEES. Eligible holdings and distinct issuers; issuers with existing datasets;
 * issuers needing provisioning; qualified and unqualified datasets; rights unknown or restricted;
 * stale, incomplete and unavailable datasets; the financial periods covered; the accounting
 * limitations affecting analysis; and overall coverage percentages with EXPLICIT DENOMINATORS —
 * reported BY ISSUER, BY SECTOR and BY ANALYTICAL METHOD (the roadmap's "issuer/sector/method
 * coverage"), not by issuer alone.
 *
 * WHICH "METHOD". The roadmap uses "method" for the applicable ANALYSIS and its method-specific
 * mandatory inputs. `coverageByAnalyticalMethod` is therefore the roadmap's third dimension: per
 * valuation method the governed method matrix declares for an issuer's sector, whether the
 * selected dataset holds that method's declared inputs (provisional pending W10).
 * `coverageByAcquisitionMethod` is a different thing — how the material reached the operator, as
 * the rights record states it. It is kept as SOURCE/RIGHTS evidence for the dossier and is never
 * to be read as the method dimension.
 *
 * RIGHTS. For every issuer with a dataset the report shows the combined rights status AND the
 * separate entitlement and retention verdicts with their reasons (`rightsAssessments`), so a
 * reader can see that retention was assessed alongside entitlement rather than assumed from it.
 *
 * WHAT A READER NEVER SEES. A hidden case. Duplicate holdings are never counted as separate issuer
 * datasets — coverage percentages are computed over DISTINCT ISSUERS and over ELIGIBLE HOLDINGS as
 * separate denominators, each labelled with its basis, and anything excluded from a denominator
 * (unresolved holdings, restricted use) is named beside it. Unresolved cases are never folded into
 * an aggregate.
 *
 * THE FINANCIAL RATIO. The portfolio-wide financial ratio θF gates on is reported here with its
 * rule on the face of the output: a holding contributes to the numerator ONLY IF ITS OWN IDENTITY
 * PASSES. Unresolved holdings never contribute; the denominator is every holding the run was
 * given. WHAT THIS REPORT DOES NOT ESTABLISH: "identity passes" here means the resolver returned
 * `RESOLVED` for the observation supplied; the report does not read the W04 census and does not
 * check that the observations are the W04 revision's persisted holdings, so it is not by itself a
 * reconciliation to W04 (`identityBasis` discloses how each identity was established). The
 * roadmap's eligible set `E` (holdings in scope under documented product-scope rules) is not
 * modelled either: the denominator is all supplied holdings, and `eligibleHoldings` below means
 * "resolved to an issuer", not the roadmap's `E`. And "holds financial data" means "served by a
 * dataset meeting the per-dataset ruleset", whose required-input set is provisional pending W10 —
 * method-specific mandatory inputs are disclosed per method, not folded into the ratio.
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
 * One entry of a coverage-dimension breakdown. The roadmap's W05 deliverable is coverage by
 * issuer, SECTOR and (analytical) METHOD; `ACQUISITION_METHOD` is a separate source/rights
 * breakdown and is not the roadmap's method dimension. Every entry names what it counts.
 *
 * For `ANALYTICAL_METHOD` the key is a method id from the governed method matrix; `issuers` and
 * `holdings` are those the method APPLIES to (the issuer's sector declares it), and
 * `holdingsWithFinancialData` counts holdings whose issuer has a selected dataset that holds every
 * declared input of that method in its newest annual period. An issuer appears under every method
 * its sector declares, so these entries overlap and do not sum to the holding count.
 */
export interface CoverageDimensionEntry {
  readonly key: string;
  readonly basis: 'SECTOR' | 'ANALYTICAL_METHOD' | 'ACQUISITION_METHOD';
  readonly issuers: number;
  readonly holdings: number;
  readonly holdingsWithFinancialData: number;
  /** 0–100 over the entry's own holdings. */
  readonly percent: number;
  readonly note: string;
}

/**
 * The rights assessment of one issuer's dataset, with the two verdicts kept apart. `status` is the
 * combined verdict (fail-closed worst of both) exactly as the rights record derived it. The
 * dataset is the one the issuer row reports: the selected dataset, or — when none is suitable —
 * the first candidate, so a dataset refused on rights still shows which verdict refused it.
 */
export interface RightsAssessmentEntry {
  readonly issuerId: string;
  readonly datasetVersion: string;
  readonly status: string;
  readonly statusReason: string;
  readonly entitlementStatus: string;
  readonly entitlementReason: string;
  readonly retentionStatus: string;
  readonly retentionReason: string;
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
  /**
   * How the identity of the resolved holdings was established, as the resolver recorded it. An
   * exchange-and-symbol match is disclosed separately from an ISIN match. This is a disclosure
   * for the W04 reconciliation; the report does not decide which basis W04 admits.
   */
  readonly identityBasis: {
    readonly isin: number;
    readonly exchangeSymbol: number;
    readonly note: string;
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
  /**
   * Coverage BY ANALYTICAL METHOD — the roadmap's "method" dimension. Method requirements are the
   * governed method matrix and are provisional pending W10.
   */
  readonly coverageByAnalyticalMethod: readonly CoverageDimensionEntry[];
  /**
   * Source/rights breakdown by how the material was ACQUIRED. Not the roadmap's method dimension.
   */
  readonly coverageByAcquisitionMethod: readonly CoverageDimensionEntry[];
  /** Combined status and the separate entitlement/retention verdicts, per issuer with a dataset. */
  readonly rightsAssessments: readonly RightsAssessmentEntry[];
  /** Issuers with a dataset, counted by each separate verdict. Never merged into one figure. */
  readonly rightsVerdicts: {
    readonly entitlement: { readonly eligible: number; readonly restricted: number; readonly unknown: number };
    readonly retention: { readonly eligible: number; readonly restricted: number; readonly unknown: number };
  };
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

/** The key for issuers whose applicable analytical methods cannot be named. */
export const METHOD_NOT_DETERMINABLE = 'METHOD_NOT_DETERMINABLE' as const;

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

  // Coverage BY SECTOR and BY ANALYTICAL METHOD (the roadmap's dimensions), plus the separate
  // source/rights breakdown by acquisition method. Unresolved holdings fail identity and therefore
  // sit outside every dimension entry — they are itemised in `unresolved`, never folded into an
  // aggregate.
  interface DimensionAccumulator {
    issuers: number;
    holdings: number;
    holdingsWithFinancialData: number;
  }
  const buildDimension = (
    basis: CoverageDimensionEntry['basis'],
    // Every key the row belongs to, and whether the row's holdings count as covered under it.
    keysOf: (row: IssuerCoverageRow) => readonly { readonly key: string; readonly covered: boolean }[],
    noteFor: (key: string) => string,
  ): readonly CoverageDimensionEntry[] => {
    const acc = new Map<string, DimensionAccumulator>();
    for (const row of rows) {
      for (const { key, covered } of keysOf(row)) {
        const entry = acc.get(key) ?? { issuers: 0, holdings: 0, holdingsWithFinancialData: 0 };
        entry.issuers += 1;
        entry.holdings += row.holdings.length;
        if (covered) entry.holdingsWithFinancialData += row.holdings.length;
        acc.set(key, entry);
      }
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
  const hasSelectedDataset = (row: IssuerCoverageRow): boolean => row.selectedDatasetVersion !== null;
  const coverageBySector = buildDimension(
    'SECTOR',
    (row) => [{ key: sectorOfRow(row), covered: hasSelectedDataset(row) }],
    (key) =>
      key === 'UNSPECIFIED'
        ? 'no dataset records a governed sector for these issuers; holdings failing identity are outside every sector entry and are itemised under `unresolved`'
        : 'sector as recorded by the issuer dataset; holdings failing identity are outside every sector entry and are itemised under `unresolved`',
  );
  // The roadmap's "method" dimension: the analytical methods the governed method matrix declares
  // for the issuer's sector. A method counts as covered for an issuer only when the SELECTED
  // dataset holds every declared input of that method in its newest annual period. An issuer with
  // no dataset, or whose dataset records no governed sector, has no nameable method and is
  // reported under METHOD_NOT_DETERMINABLE rather than being left out.
  const coverageByAnalyticalMethod = buildDimension(
    'ANALYTICAL_METHOD',
    (row) => {
      const methods = row.qualification?.methodCoverage.methods ?? [];
      if (methods.length === 0) return [{ key: METHOD_NOT_DETERMINABLE, covered: false }];
      return methods.map((method) => ({
        key: method.methodId,
        covered: hasSelectedDataset(row) && method.latestPeriodQualified,
      }));
    },
    (key) =>
      key === METHOD_NOT_DETERMINABLE
        ? 'no dataset records a governed sector for these issuers, so the applicable analytical methods cannot be named and no method coverage is claimed; holdings failing identity are outside every method entry and are itemised under `unresolved`'
        : 'analytical method from the governed method matrix for the issuer sector; covered means the selected dataset holds every declared input of this method in its newest annual period; the method requirements are provisional pending W10; an issuer appears under every method its sector declares, so entries overlap; holdings failing identity are outside every method entry and are itemised under `unresolved`',
  );
  // Source/rights evidence, NOT the roadmap's method dimension: how the material was acquired.
  const coverageByAcquisitionMethod = buildDimension(
    'ACQUISITION_METHOD',
    (row) => [{ key: acquisitionMethodOfRow(row), covered: hasSelectedDataset(row) }],
    (key) =>
      key === 'NOT_PROVISIONED'
        ? 'no dataset provisioned for these issuers yet; acquisition method is recorded per dataset (lifecycle/rightsRecord.ts) and provisioned coverage will appear under its method; this is a source/rights breakdown, not the roadmap method dimension'
        : 'acquisition method as recorded in the dataset rights record — a source/rights breakdown, not the roadmap method dimension; holdings failing identity are outside every entry and are itemised under `unresolved`',
  );

  // Entitlement and retention, kept apart for every issuer that has a dataset. The combined status
  // is carried beside them unchanged; nothing here re-derives or relaxes a verdict.
  const rightsAssessments: RightsAssessmentEntry[] = rows.flatMap((row) => {
    const qualification = row.qualification;
    if (qualification === null) return [];
    const rights = qualification.evidence.rights;
    return [
      {
        issuerId: row.issuerId,
        datasetVersion: qualification.datasetVersion,
        status: rights.status,
        statusReason: rights.statusReason,
        entitlementStatus: rights.entitlementStatus,
        entitlementReason: rights.entitlementReason,
        retentionStatus: rights.retentionStatus,
        retentionReason: rights.retentionReason,
      },
    ];
  });
  // Anything that is not an explicit ELIGIBLE or RESTRICTED verdict counts as unknown: fail closed.
  const verdictCounts = (verdictOf: (entry: RightsAssessmentEntry) => string) => ({
    eligible: rightsAssessments.filter((entry) => verdictOf(entry) === 'ELIGIBLE_LOCAL_PERSONAL_USE').length,
    restricted: rightsAssessments.filter((entry) => verdictOf(entry) === 'RESTRICTED').length,
    unknown: rightsAssessments.filter(
      (entry) => verdictOf(entry) !== 'ELIGIBLE_LOCAL_PERSONAL_USE' && verdictOf(entry) !== 'RESTRICTED',
    ).length,
  });
  const rightsVerdicts = {
    entitlement: verdictCounts((entry) => entry.entitlementStatus),
    retention: verdictCounts((entry) => entry.retentionStatus),
  };

  // How each resolved holding's identity was established, as the resolver recorded it.
  const resolvedHoldings = rows.flatMap((row) => row.holdings);
  const identityBasis = {
    isin: resolvedHoldings.filter((holding) => holding.resolutionBasis === 'ISIN').length,
    exchangeSymbol: resolvedHoldings.filter((holding) => holding.resolutionBasis === 'EXCHANGE_SYMBOL').length,
    note:
      'resolution basis as recorded by the identity resolver for the observations supplied to this run; this report does not read the W04 census, so whether these holdings are the W04 identity-passed holdings is established only by reconciling the run to the W04 revision',
  };

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
    'coverage is reported by issuer, by sector and by analytical method (the roadmap method dimension; method requirements are provisional pending W10); the breakdown by acquisition method is source/rights evidence and is not the method dimension; dimension entries cover identity-passed holdings only.',
  );
  notes.push(
    'identity passes here means the resolver returned RESOLVED for the observation supplied; the report does not read the W04 census and is not by itself a reconciliation to W04 — the resolution basis of every resolved holding is disclosed under `identityBasis`.',
  );
  notes.push(
    'entitlement and retention are assessed separately and reported side by side under `rightsAssessments`; the combined rights status is the fail-closed worst of both.',
  );
  notes.push(
    'W05 remains IN PROGRESS — NOT ACCEPTED: actual portfolio coverage is not established by this report, and the required-metric set and the method requirements are provisional pending W10. θF is the portfolio-wide ratio that gates W20 and is NOT a W05 condition.',
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
    identityBasis,
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
    coverageByAnalyticalMethod,
    coverageByAcquisitionMethod,
    rightsAssessments,
    rightsVerdicts,
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
  for (const entry of report.coverageByAnalyticalMethod) {
    lines.push(
      `coverage by analytical method [${entry.key}] (provisional pending W10): ${entry.holdingsWithFinancialData}/${entry.holdings} holdings = ${entry.percent}%`,
    );
  }
  for (const entry of report.coverageByAcquisitionMethod) {
    lines.push(
      `source/rights — by acquisition method [${entry.key}] (not the method dimension): ${entry.holdingsWithFinancialData}/${entry.holdings} holdings = ${entry.percent}%`,
    );
  }
  lines.push(
    `identity basis of resolved holdings: ISIN ${report.identityBasis.isin}, exchange-and-symbol ${report.identityBasis.exchangeSymbol} (not a W04 reconciliation)`,
  );
  lines.push(
    `rights verdicts (issuers with a dataset): entitlement eligible ${report.rightsVerdicts.entitlement.eligible} / restricted ${report.rightsVerdicts.entitlement.restricted} / unknown ${report.rightsVerdicts.entitlement.unknown}; ` +
      `retention eligible ${report.rightsVerdicts.retention.eligible} / restricted ${report.rightsVerdicts.retention.restricted} / unknown ${report.rightsVerdicts.retention.unknown}`,
  );
  for (const entry of report.rightsAssessments) {
    lines.push(
      `rights [${entry.issuerId}]: combined ${entry.status}; entitlement ${entry.entitlementStatus} (${entry.entitlementReason}); retention ${entry.retentionStatus} (${entry.retentionReason})`,
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
