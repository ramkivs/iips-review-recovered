/**
 * IID-0 — R-16 coverage measurement foundation.
 *
 * Separates two different questions that must never be conflated (design of record Part II §R-16, Part III §I.2):
 *   1. what has been MEASURED (a completed measurement is a fact about the dataset), and
 *   2. what remains OUTSTANDING (sector coverage not yet achieved).
 *
 * A sector with no data is reported as UNMEASURED, not as "passed". Availability of a method requires a
 * real issuer-period with every mandatory input present; a missing input makes the method WITHHELD with a
 * reason, which is the only correct answer for a method we cannot compute.
 */
import { LINE_ITEMS, type LineItemId } from '../contracts/lineItems';
import { OPERATING_METRICS, type MetricId, type SectorName } from '../contracts/operatingMetrics';
import type { DatasetContent, NormalizedPeriod } from '../fundamentals/types';
import { SECTOR_METHODS, type MethodId, type MethodRequirement, type MethodRole } from './methodMatrix';

export type MethodState = 'AVAILABLE' | 'WITHHELD';

export type WithheldReason =
  | 'MANDATORY_METRIC_MISSING'
  | 'METRIC_UNVALIDATED'
  | 'STATEMENT_INPUT_MISSING'
  | 'NO_DATA_FOR_SECTOR';

export interface MethodMeasurement {
  readonly methodId: MethodId;
  readonly role: MethodRole;
  readonly state: MethodState;
  readonly reason: WithheldReason | null;
  readonly missing: readonly string[];
  readonly issuersAvailable: readonly string[];
  readonly issuersConsidered: number;
}

export type SectorStage = 'G1_ENABLED' | 'G2_PARTIAL' | 'G3_WITHHELD' | 'UNMEASURED';

export interface SectorMeasurement {
  readonly sector: SectorName;
  readonly issuersConsidered: readonly string[];
  readonly annualPeriodsConsidered: number;
  readonly statementCoveragePct: number;
  readonly operatingMetricCoveragePct: number;
  readonly stage: SectorStage;
  readonly measured: boolean;
  readonly usableMethods: readonly MethodId[];
  readonly withheldMethods: readonly MethodId[];
  readonly methods: readonly MethodMeasurement[];
}

export interface CoverageReport {
  readonly reportVersion: 1;
  readonly datasetVersion: string;
  readonly generatedAt: string;
  readonly note: string;
  readonly sectors: readonly SectorMeasurement[];
  /** Sectors with an actual measurement performed against this dataset. */
  readonly completedMeasurements: readonly SectorName[];
  /** Sectors with no measurement yet — explicitly outstanding, never silently green. */
  readonly outstandingSectors: readonly SectorName[];
  readonly methodLevelNote: string;
}

const REASON_ORDER: readonly WithheldReason[] = [
  'NO_DATA_FOR_SECTOR',
  'MANDATORY_METRIC_MISSING',
  'STATEMENT_INPUT_MISSING',
  'METRIC_UNVALIDATED',
];

function presentLineItem(period: NormalizedPeriod, item: LineItemId): boolean {
  const observation = period.values[item] ?? period.derived[item];
  return observation !== undefined && observation.presence === 'PRESENT' && observation.value !== null;
}

function validMetric(content: DatasetContent, issuerId: string, periodEnd: string, metricId: MetricId): boolean {
  return content.operatingMetrics.some(
    (record) =>
      record.issuerId === issuerId &&
      record.periodEnd === periodEnd &&
      record.metricId === metricId &&
      record.validation === 'VALID' &&
      record.observation.presence === 'PRESENT' &&
      record.observation.value !== null,
  );
}

function measureMethod(
  requirement: MethodRequirement,
  sector: SectorName,
  issuerIds: readonly string[],
  annualPeriods: readonly NormalizedPeriod[],
  content: DatasetContent,
): MethodMeasurement {
  const periodsFor = (issuerId: string): readonly NormalizedPeriod[] =>
    annualPeriods.filter((period) => period.issuerId === issuerId);

  if (issuerIds.length === 0 || annualPeriods.length === 0) {
    return {
      methodId: requirement.methodId,
      role: requirement.role,
      state: 'WITHHELD',
      reason: 'NO_DATA_FOR_SECTOR',
      missing: [...requirement.lineItems, ...requirement.metrics],
      issuersAvailable: [],
      issuersConsidered: 0,
    };
  }

  const available: string[] = [];
  const missingItems = new Set<string>();
  let sawStatementGap = false;
  let sawMetricGap = false;
  let sawUnvalidated = false;

  for (const issuerId of issuerIds) {
    for (const period of periodsFor(issuerId)) {
      const missingLineItems = requirement.lineItems.filter((item) => !presentLineItem(period, item));
      const missingMetrics = requirement.metrics.filter(
        (metricId) => !validMetric(content, issuerId, period.period.periodEnd, metricId),
      );
      if (missingLineItems.length === 0 && missingMetrics.length === 0) {
        available.push(issuerId);
        continue;
      }
      missingLineItems.forEach((item) => missingItems.add(item));
      missingMetrics.forEach((metricId) => missingItems.add(metricId));
      if (missingLineItems.length > 0) sawStatementGap = true;
      if (missingMetrics.length > 0) {
        sawMetricGap = true;
        const knownButInvalid = content.operatingMetrics.some(
          (record) =>
            record.issuerId === issuerId &&
            record.periodEnd === period.period.periodEnd &&
            missingMetrics.includes(record.metricId) &&
            record.validation !== 'VALID',
        );
        if (knownButInvalid) sawUnvalidated = true;
      }
    }
  }

  if (available.length > 0) {
    return {
      methodId: requirement.methodId,
      role: requirement.role,
      state: 'AVAILABLE',
      reason: null,
      missing: [],
      issuersAvailable: [...new Set(available)].sort(),
      issuersConsidered: issuerIds.length,
    };
  }

  const reason: WithheldReason = sawStatementGap
    ? 'STATEMENT_INPUT_MISSING'
    : sawUnvalidated
      ? 'METRIC_UNVALIDATED'
      : sawMetricGap
        ? 'MANDATORY_METRIC_MISSING'
        : 'NO_DATA_FOR_SECTOR';
  const missing = [...missingItems].sort((a, b) => REASON_ORDER.indexOf(a as WithheldReason) - REASON_ORDER.indexOf(b as WithheldReason) || a.localeCompare(b));
  return {
    methodId: requirement.methodId,
    role: requirement.role,
    state: 'WITHHELD',
    reason,
    missing,
    issuersAvailable: [],
    issuersConsidered: issuerIds.length,
  };
}

/** Union of every line item / metric the sector's methods declare — the denominator for coverage. */
export function sectorRequirements(sector: SectorName): { lineItems: readonly LineItemId[]; metrics: readonly MetricId[] } {
  const methods = SECTOR_METHODS[sector];
  return {
    lineItems: [...new Set(methods.flatMap((method) => method.lineItems))].sort(),
    metrics: [...new Set(methods.flatMap((method) => method.metrics))].sort(),
  };
}

export function measureCoverage(
  content: DatasetContent,
  options: { readonly datasetVersion: string; readonly generatedAt: string },
): CoverageReport {
  const sectors = (Object.keys(SECTOR_METHODS) as SectorName[]).sort();
  const measurements: SectorMeasurement[] = [];

  for (const sector of sectors) {
    const issuerIds = content.issuers
      .filter((issuer) => issuer.sector === sector)
      .map((issuer) => issuer.issuerId)
      .sort();
    const annualPeriods = content.periods.filter(
      (period) => period.period.periodType === 'ANNUAL' && issuerIds.includes(period.issuerId),
    );
    const { lineItems, metrics } = sectorRequirements(sector);

    let statementPct = 0;
    if (annualPeriods.length > 0 && lineItems.length > 0) {
      let present = 0;
      for (const period of annualPeriods) {
        for (const item of lineItems) if (presentLineItem(period, item)) present += 1;
      }
      statementPct = Math.round((present / (annualPeriods.length * lineItems.length)) * 1000) / 10;
    }

    let metricPct = 0;
    if (metrics.length > 0 && annualPeriods.length > 0) {
      let valid = 0;
      for (const period of annualPeriods) {
        for (const metricId of metrics) {
          if (validMetric(content, period.issuerId, period.period.periodEnd, metricId)) valid += 1;
        }
      }
      metricPct = Math.round((valid / (annualPeriods.length * metrics.length)) * 1000) / 10;
    } else if (metrics.length === 0) {
      metricPct = 100;
    }

    const methods = SECTOR_METHODS[sector].map((requirement) =>
      measureMethod(requirement, sector, issuerIds, annualPeriods, content),
    );
    const usableMethods = methods.filter((method) => method.state === 'AVAILABLE').map((method) => method.methodId);
    const withheldMethods = methods.filter((method) => method.state === 'WITHHELD').map((method) => method.methodId);
    const measured = issuerIds.length > 0 && annualPeriods.length > 0;
    const stage: SectorStage = !measured
      ? 'UNMEASURED'
      : withheldMethods.length === 0
        ? 'G1_ENABLED'
        : usableMethods.length > 0
          ? 'G2_PARTIAL'
          : 'G3_WITHHELD';

    measurements.push({
      sector,
      issuersConsidered: issuerIds,
      annualPeriodsConsidered: annualPeriods.length,
      statementCoveragePct: statementPct,
      operatingMetricCoveragePct: metricPct,
      stage,
      measured,
      usableMethods,
      withheldMethods,
      methods,
    });
  }

  const completed = measurements.filter((measurement) => measurement.measured).map((measurement) => measurement.sector);
  const outstanding = measurements.filter((measurement) => !measurement.measured).map((measurement) => measurement.sector);

  return {
    reportVersion: 1,
    datasetVersion: options.datasetVersion,
    generatedAt: options.generatedAt,
    note:
      'Completed measurements are facts about this dataset. Outstanding sectors are NOT computed and are NOT a pass; absence of data never implies adequacy or inadequacy of a business.',
    sectors: measurements,
    completedMeasurements: completed,
    outstandingSectors: outstanding,
    methodLevelNote:
      'Availability is per method. A sector stage of G1/G2 describes how far the sector has been enabled for measurement; it does not mean every method in the sector is usable.',
  };
}

/** Human-readable one-block summary used by the CLI and by test evidence. */
export function renderCoverageSummary(report: CoverageReport): string {
  const lines: string[] = [
    `dataset          ${report.datasetVersion}`,
    `completed        ${report.completedMeasurements.length}/${report.sectors.length} sectors measured`,
    ...report.sectors.map((sector) => {
      const usable = sector.usableMethods.length;
      const withheld = sector.withheldMethods.length;
      return `  ${sector.sector.padEnd(16)} ${sector.stage.padEnd(12)} usable ${usable}  withheld ${withheld}  stmt ${sector.statementCoveragePct}%  metric ${sector.operatingMetricCoveragePct}%`;
    }),
    `outstanding      ${report.outstandingSectors.length === 0 ? 'none' : report.outstandingSectors.join(', ')}`,
    `methods declared ${Object.values(SECTOR_METHODS).flat().length} across ${report.sectors.length} sectors; metric ids in vocabulary ${Object.keys(OPERATING_METRICS).length}; line items ${Object.keys(LINE_ITEMS).length}`,
  ];
  return lines.join('\n');
}
