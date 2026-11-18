/**
 * IID-0 — R-16 coverage measurement foundation.
 *
 * Separates three questions that must never be conflated (design of record Part II §R-16, Part III §I.2): what
 * has been MEASURED (a fact about the dataset), what remains OUTSTANDING, and — NOT answered here — whether a
 * VALUATION WOULD BE PRODUCED (`S4-R4`): `usable` describes inputs; see the contract note at this file's end.
 *
 * A sector with no data is reported as UNMEASURED, not as "passed". Availability of a method requires a
 * real issuer-period with every mandatory input present; a missing input makes the method WITHHELD with a
 * reason, which is the only correct answer for a method we cannot compute.
 */
import { LINE_ITEMS, type LineItemId } from '../contracts/lineItems';
import { OPERATING_METRICS, SECTOR_NAMES, type MetricId, type SectorName } from '../contracts/operatingMetrics';
import type { DatasetContent, NormalizedPeriod } from '../fundamentals/types';
import { findInvalidIssuerSectors, type InvalidIssuerSector } from '../ingestion/sectorValidation';
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
  /**
   * Issuers in this dataset whose `sector` is not exactly a canonical `SectorName` (`G-7`, `G-14`).
   *
   * WHY THIS FIELD EXISTS. Sector membership below is decided by string equality
   * (`content.issuers.filter((issuer) => issuer.sector === sector)`), and `IssuerRecord.sector` is
   * typed `SectorName` only by a compile-time cast that is erased at runtime. An issuer whose sector is
   * off-vocabulary therefore matches **no** sector: it is absent from every `issuersConsidered`, its
   * sector reports `UNMEASURED`, and before this field existed nothing anywhere said that an issuer had
   * been dropped. `S3-D1` closed the ingestion CLI, but `assertValidIssuerSectors` has exactly one call
   * site, so a dataset written by any other path — or by a build predating `S3-D1`, or hand-authored
   * per `G-14` — arrives here intact and digest-consistent and still measures zero. This is the read
   * side of the same defect, and it is where every consumer actually passes through.
   *
   * REPORTED, NEVER REPAIRED. Nothing here trims, case-folds or otherwise normalises a sector, and no
   * measurement is widened to accommodate one: `findInvalidIssuerSectors` is the same pure classifier the
   * ingestion guard uses, so both sides of the seam answer from one vocabulary authority. An
   * off-vocabulary issuer is a reason to distrust the measurement, not a value to be quietly fixed —
   * repairing it would make the report differ from the dataset it claims to describe.
   *
   * Empty for a canonical dataset. Non-empty means `completedMeasurements` UNDERSTATES the dataset and
   * must not be read as a coverage position until the sector is corrected at source.
   */
  readonly offVocabularyIssuers: readonly InvalidIssuerSector[];
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
      // `S4-R5`: shared with `qualificationOf` (end of file), so the existential answer here cannot drift.
      const missing = missingInputsFor(requirement, period, content);
      const missingLineItems = missing.lineItems;
      const missingMetrics = missing.metrics;
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

  /*
   * Computed BEFORE the sector loop, because it is a fact about the dataset rather than about any one
   * sector: an off-vocabulary issuer belongs to no sector, so no iteration of the loop below can see it.
   * `content.issuers` is passed as-is — `UnvalidatedIssuer` is `unknown`-typed on purpose, so a record
   * that is *typed* `SectorName` is still examined as the untrusted value it actually is at runtime.
   */
  const offVocabularyIssuers = findInvalidIssuerSectors(content.issuers);

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
    offVocabularyIssuers,
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
    ...sectorVocabularyLines(report),
  ];
  return lines.join('\n');
}

/**
 * The sector-vocabulary line, and one indented line per offending issuer.
 *
 * WHY THIS IS PRINTED UNCONDITIONALLY (`G-7`). `CPII-01` §12.2 requires that an operationalisation verify
 * `measuredSectors > 0` rather than `datasetClass !== 'NONE'`, because an off-vocabulary sector produces a
 * zero that looks exactly like a sector with no issuers. A line that appears only when something is wrong
 * cannot distinguish "checked and clean" from "not checked" — so the clean case states itself too, and a
 * reader of the ingest output can see that the vocabulary was actually tested against all
 * `SECTOR_NAMES.length` canonical values on this dataset's issuers.
 *
 * The wording never softens a non-empty result into a warning about measurement: it says plainly that the
 * issuer matched no sector and that `completed` above therefore understates the dataset.
 */
export function sectorVocabularyLines(report: CoverageReport): readonly string[] {
  const total = report.sectors.length;
  const offending = report.offVocabularyIssuers;
  if (offending.length === 0) {
    return [`sector vocabulary  every issuer carries one of the ${total} canonical sectors; none was dropped`];
  }
  // `issuersConsidered` is the list of issuer ids per sector, and an issuer matches at most one sector,
  // so summing the lengths counts every issuer that WAS placed; the offenders are the ones that were not.
  const placed = report.sectors.reduce((sum, sector) => sum + sector.issuersConsidered.length, 0);
  const issuerCount = placed + offending.length;
  return [
    `sector vocabulary  ${offending.length} of ${issuerCount} issuer(s) OFF-VOCABULARY: matched no sector, ` +
      `excluded from every measurement, so "completed" above UNDERSTATES this dataset`,
    ...offending.map((entry) => {
      const hint =
        entry.suggestion === null
          ? `not one of the ${SECTOR_NAMES.length} canonical values, and no trimming or case-folding would fix it`
          : `${entry.suggestion.correction}: the canonical value is ${JSON.stringify(entry.suggestion.sector)}`;
      return `  ${entry.issuerId} (${entry.legalName}): sector is ${entry.received} — ${entry.reason}; ${hint}`;
    }),
    `  correct the sector at source and re-ingest; this measurement never rewrites a sector`,
  ];
}

/**
 * `S4-R5` — the ONE definition of "this annual period qualifies for this method".
 *
 * A method's declared requirements are satisfied by a period when every declared line item is `PRESENT` (with a
 * number, as filed or derived) and every declared operating metric is `VALID` at that period end. Nothing else is
 * consulted: no policy, no threshold, no clock. `measureMethod` above and `qualificationOf` below both call this
 * function, so the existential-availability answer and the per-issuer "does the LATEST period support it" answer
 * cannot drift apart.
 *
 * Declared here rather than beside `measureMethod` so that no line above this point moves: the line references in
 * the Stage 4 records (`S4-R2`, `S4-R4`) continue to resolve.
 */
function missingInputsFor(
  requirement: MethodRequirement,
  period: NormalizedPeriod,
  content: DatasetContent,
): { lineItems: LineItemId[]; metrics: MetricId[] } {
  return {
    lineItems: requirement.lineItems.filter((item) => !presentLineItem(period, item)),
    metrics: requirement.metrics.filter(
      (metricId) => !validMetric(content, period.issuerId, period.period.periodEnd, metricId),
    ),
  };
}

/** One (issuer, annual period) pair that satisfies a method's declared input requirements. */
export interface MethodQualification {
  readonly issuerId: string;
  readonly periodEnd: string;
}

export interface MethodQualificationSummary {
  /** Every qualifying pair, newest period first (ties by issuer id). Empty when nothing qualifies. */
  readonly qualifyingPeriods: readonly MethodQualification[];
  /** The newest annual period in scope — the one a latest-period reading looks at — or `null` for no data. */
  readonly latestPeriod: MethodQualification | null;
  /** Whether that newest period itself satisfies the declared requirements. `false` when there is no period. */
  readonly latestPeriodQualified: boolean;
}

/**
 * `S4-R5` — historical availability and latest-period qualification, from the same predicate.
 *
 * THE OWNER DECISION THIS SERVES. Coverage availability is **existential over annual periods**: a method is
 * historically `AVAILABLE` when at least one eligible (issuer, annual period) pair satisfies its declared
 * requirements, and that says nothing about the latest period. This function reports both facts separately —
 * `qualifyingPeriods` is the historical answer, `latestPeriod`/`latestPeriodQualified` is what the newest period
 * supports — and neither is a valuation statement: whether an assessment can compute a figure is decided by
 * `assessment/engine.ts`, with its own instant, bridge, history and blend rules (`S4-R4`).
 *
 * DISCLOSURE ONLY. Nothing in this function feeds a valuation, a derived figure, a freshness decision or a
 * measurement state; `measureMethod` above is unchanged in behaviour, and a non-qualifying period is never
 * substituted with a zero or with an older period's values.
 */
export function qualificationOf(input: {
  readonly requirement: MethodRequirement;
  readonly issuerIds: readonly string[];
  readonly annualPeriods: readonly NormalizedPeriod[];
  readonly content: DatasetContent;
}): MethodQualificationSummary {
  const pairs: { issuerId: string; periodEnd: string; period: NormalizedPeriod }[] = [];
  for (const issuerId of input.issuerIds) {
    for (const period of input.annualPeriods) {
      if (period.issuerId !== issuerId) continue;
      pairs.push({ issuerId, periodEnd: period.period.periodEnd, period });
    }
  }
  // Newest first; a tie on the period end is broken by issuer id so the answer cannot depend on input order.
  pairs.sort((a, b) =>
    a.periodEnd === b.periodEnd
      ? a.issuerId < b.issuerId
        ? -1
        : a.issuerId > b.issuerId
          ? 1
          : 0
      : a.periodEnd < b.periodEnd
        ? 1
        : -1,
  );
  const qualifyingPeriods: MethodQualification[] = [];
  for (const pair of pairs) {
    const missing = missingInputsFor(input.requirement, pair.period, input.content);
    if (missing.lineItems.length === 0 && missing.metrics.length === 0) {
      qualifyingPeriods.push({ issuerId: pair.issuerId, periodEnd: pair.periodEnd });
    }
  }
  const first = pairs[0];
  const latestPeriod = first === undefined ? null : { issuerId: first.issuerId, periodEnd: first.periodEnd };
  const latestPeriodQualified =
    latestPeriod !== null &&
    qualifyingPeriods.some(
      (entry) => entry.issuerId === latestPeriod.issuerId && entry.periodEnd === latestPeriod.periodEnd,
    );
  return { qualifyingPeriods, latestPeriod, latestPeriodQualified };
}

/* ====================================================================================================== *
 * `S4-R4` — THE CONTRACT: `usable` IS NOT A VALUATION. Read this before reading `usableMethods`.
 *
 * THE WINDOW DIFFERENCE, stated once so no caller has to infer it:
 *   • THIS MODULE IS EXISTENTIAL. A method is `AVAILABLE` when AT LEAST ONE (issuer, annual period) pair
 *     carries every declared input (`measureMethod` above); one old year is enough. The inputs of one method
 *     must come from the SAME period, but nothing here asks which period is newest, and nothing here knows
 *     the assessment clock.
 *   • THE ASSESSMENT (`assessment/engine.ts`) resolves ONE series for ONE issuer at ONE clock: each
 *     capital-structure component takes its newest informative period, the components must share an instant
 *     or the aggregate is refused, each method demands its own history (three annual observations for the
 *     cash-flow, multiple and revenue families), the enterprise-to-equity bridge must convert, and the blend
 *     publishes an intrinsic range only when EVERY weighted method produced a per-share number (INV-5).
 *
 * CONSEQUENCES A READER MUST CARRY AWAY (each is observable; none is a defect):
 *   (a) `AVAILABLE` does not mean an issuer can be valued — it is a sector-level statement about inputs.
 *   (b) `AVAILABLE` does not mean the LATEST period supports the method — the existential window above.
 *   (c) `WITHHELD / STATEMENT_INPUT_MISSING` can UNDERSTATE capability: the assessment resolves net debt
 *       through the capital-structure aggregation, which admits a declared `NIL_BY_DISCLOSURE` as a named
 *       zero, while the derivation set that produces `NET_DEBT` accepts reported numbers only. Coverage reads
 *       that derivation; the assessment never uses it.
 *   (d) The two input sets differ: the derivation of `NET_DEBT` uses three line items, the aggregation uses
 *       four debt components (leases included) and two cash-side components, and requires one instant.
 *   (e) An operating metric counts here when it is `VALID` at ANY annual period end; the assessment resolves
 *       it at the LATEST annual period end and applies a source-class floor.
 *   (f) A method the engine does not implement at all (`METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1`) can still be
 *       `AVAILABLE` here, because availability is a property of the dataset, not of the engine.
 *
 * WHEN THE TWO LAYERS DISAGREE, READ BOTH REASONS. Do not reconcile them by changing a threshold, a
 * derivation, an aggregate or a policy: the register records that boundary as an owner decision (`S4-R5`, on
 * whether availability should remain existential over annual periods) and as a measurement-semantics
 * decision (whether the derivation set should admit a declared nil). This module keeps reporting what the
 * DATASET contains; it does not become a valuation statement.
 *
 * Long form, with the measured examples and the pinned tests:
 *   docs/integration/IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md
 * ====================================================================================================== */
