/**
 * IID — investment coverage: the financial/dataset coverage read, INDEPENDENT of identity.
 *
 * WHY THIS EXISTS
 *   Identity Coverage and Investment Coverage are two different questions:
 *
 *     Identity Coverage    — "does this observed row have a defensible issuer/security/listing?"
 *     Investment Coverage  — "what investment data does the served dataset actually cover?"
 *
 *   The dataset coverage question is answered by the local snapshot store (issuers, securities,
 *   periods, prices, operating metrics, corporate actions) and by the sector measurement. None of
 *   that needs the eligible roster, the listing map or the corporate-action identity table. The
 *   identity sources answer a question about a ROW; the dataset answers a question about the DATA.
 *
 *   Previously one endpoint served both pages and short-circuited to 503 when the identity files
 *   were absent, so an identity-source problem erased the investment-coverage position entirely.
 *   The independence already existed in the data layer (`financialCoverageFromLocalDataset` reads
 *   the snapshot store, never the identity dir); this module exposes it as its own read model.
 *
 * FAIL-CLOSED, IN ITS OWN TERMS
 *   An absent or unreadable dataset is reported as `datasetClass: 'NONE'` with an explicit reason.
 *   It is NOT an error, and it is NOT an identity error. Nothing is estimated and no issuer is
 *   invented: an issuer that is not in the dataset is simply not covered, and the report says so.
 *
 * READ-ONLY. No write, no store, no cache, no persistence.
 */
import { measureCoverage, type CoverageReport, type SectorMeasurement } from './measure';
import type { InvalidSectorReason } from '../ingestion/sectorValidation';
import {
  buildFinancialCoverageDisclosure,
  type FinancialCoverageDisclosure,
} from '../identity/coverage';
import { DERIVATIONS } from '../fundamentals/derive';
import { XBRL_TAG_MAP } from '../ingestion/xbrl';
import type { DatasetManifest } from '../fundamentals/manifest';
import type {
  IngestionIssue,
  IssuerRecord,
  NormalizedPeriod,
  PriceRecord,
  SecurityRecord,
} from '../fundamentals/types';
import type { OperatingMetricRecord } from '../contracts/operatingMetrics';

/** The issuer-level investment-coverage position. */
export type InvestmentCoverageState =
  /** The issuer is in the dataset and has at least one period of financial data. */
  | 'COVERED'
  /** The issuer is in the dataset but has no financial period yet. */
  | 'NO_FINANCIALS'
  /** The issuer is in the dataset with periods, but its sector method is withheld/unmeasured. */
  | 'SECTOR_NOT_MEASURED'
  /** The issuer is in the dataset but its data carries an ingestion issue. */
  | 'ISSUED_DATA';

/** One issuer's row in the investment-coverage report. */
export interface InvestmentCoverageIssuerRow {
  readonly issuerId: string;
  readonly legalName: string;
  readonly sector: string;
  readonly subSegment: string | null;
  readonly reportingCurrency: string;
  readonly fiscalYearEnd: string;
  readonly state: InvestmentCoverageState;
  /** Annual periods present for this issuer. */
  readonly annualPeriods: number;
  /** Quarterly periods present for this issuer. */
  readonly quarterlyPeriods: number;
  readonly securities: number;
  readonly prices: number;
  readonly operatingMetrics: number;
  readonly latestPeriodEnd: string | null;
  readonly earliestPeriodEnd: string | null;
  /** Ingestion issue codes that touch this issuer. Empty when the issuer's data is clean. */
  readonly issueCodes: readonly string[];
  /**
   * Whether this issuer's investment assessment depends on an identity binding.
   *
   * IID IDENTITY DEPENDENCY, DISCLOSED AT ROW LEVEL. An investment-coverage row states what the
   * dataset holds for an issuer. Where a downstream assessment of that issuer additionally needs an
   * identity binding (issuer -> security -> listing), the absence of the identity sources is
   * disclosed HERE, on the row, rather than replacing the whole investment-coverage page with an
   * identity error. The flag is `null` when the dependency cannot be evaluated at all (the caller
   * has no identity state to consult) — `null` is not `false`: it means "not evaluated", never
   * "no dependency".
   */
  readonly identityDependency: 'RESOLVED' | 'UNRESOLVED' | null;
  readonly identityDependencyDetail: string | null;
}

/**
 * One issuer whose `sector` is not a canonical `SectorName` and therefore matched no sector measurement.
 *
 * The served form of `CoverageReport.offVocabularyIssuers`. The roster `index` is dropped here because it
 * is a position in an input file the served surface never saw; the value, the reason and the canonical
 * correction are kept because those are what an operator acts on.
 */
export interface OffVocabularySectorIssuer {
  readonly issuerId: string;
  readonly legalName: string;
  /** The value as written, rendered so `null`, padding and non-strings are unambiguous. */
  readonly sectorAsWritten: string;
  readonly reason: InvalidSectorReason;
  /** The canonical sector when a near miss is worth naming; `null` when no transformation would fix it. */
  readonly canonicalSector: string | null;
  readonly correction: string | null;
}

/** The whole investment-coverage read model. */
export interface InvestmentCoverageReport {
  readonly reportVersion: 1;
  readonly asOf: string;
  readonly generatedAt: string;
  /** The dataset's own identity: version, digest, provider, licence. */
  readonly dataset: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly licence: string;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
    readonly lastImportAt: string;
    readonly importRunId: string;
    readonly quality: 'good' | 'stale' | 'partial' | 'unavailable';
    readonly completenessPct: number;
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE';
    readonly issuers: number;
    readonly securities: number;
    readonly listings: number;
    readonly annualPeriods: number;
    readonly quarterlyPeriods: number;
    readonly prices: number;
    readonly operatingMetricRecords: number;
    readonly corporateActions: number;
    readonly earliestPeriodEnd: string | null;
    readonly latestPeriodEnd: string | null;
  };
  /** Sector-level method measurement — the "investment coverage" position per sector. */
  readonly sectors: readonly SectorMeasurement[];
  readonly measuredSectors: number;
  readonly totalSectors: number;
  readonly outstandingSectors: readonly string[];
  /**
   * Issuers excluded from every sector measurement because their `sector` is off-vocabulary (`G-7`).
   *
   * Empty for a canonical dataset, and `measuredSectors` above is then the dataset's real position.
   * NON-EMPTY MEANS `measuredSectors` UNDERSTATES the dataset: those issuers are present, have financials,
   * and are counted nowhere, while their sector reports `UNMEASURED` exactly as a sector with no issuers
   * does. This is disclosure rather than a gate — it never fails the surface, changes a row's state, or
   * repairs a value, because a report that silently rewrote a sector would differ from the dataset it
   * claims to describe.
   */
  readonly offVocabularyIssuers: readonly OffVocabularySectorIssuer[];
  /** Per-issuer rows, sorted by issuer id. */
  readonly issuers: readonly InvestmentCoverageIssuerRow[];
  readonly counts: Readonly<Record<InvestmentCoverageState | 'observed', number>>;
  /** Ingestion issues observed across the dataset (not per issuer). */
  readonly issues: readonly { readonly code: string; readonly subject: string; readonly detail: string }[];
  /** The IID-0 financial-coverage disclosure, carried verbatim. */
  readonly financialCoverage: FinancialCoverageDisclosure;
  readonly statusLine: string;
  readonly notes: readonly string[];
  /**
   * Whether the identity sources were available when this report was produced.
   *
   * This is DISCLOSURE, not a gate. A `false` here means the identity files could not be loaded, so
   * no identity binding could be evaluated for any issuer; the investment-coverage position above
   * is still the truthful position of the dataset. It never turns into a page-level failure.
   */
  readonly identitySourcesAvailable: boolean;
  readonly identitySourceDetail: string | null;
}

/** Everything the computation reads. Injected: this module performs no I/O of its own. */
export interface InvestmentCoverageInput {
  readonly asOf: string;
  readonly generatedAt: string;
  readonly manifest: DatasetManifest | null;
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly SecurityRecord[];
  readonly periods: readonly NormalizedPeriod[];
  readonly prices: readonly PriceRecord[];
  readonly operatingMetrics: readonly OperatingMetricRecord[];
  readonly issues: readonly IngestionIssue[];
  /** Whether the identity sources were loadable. Disclosed, never enforced here. */
  readonly identitySourcesAvailable: boolean;
  readonly identitySourceDetail?: string | null;
  /**
   * Per-issuer identity binding state, when the caller could evaluate it.
   * `null` means the dependency could not be evaluated (identity sources absent).
   */
  readonly issuerIdentityState?: ReadonlyMap<string, 'RESOLVED' | 'UNRESOLVED'> | null;
}

function financialClass(manifest: DatasetManifest | null): 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE' {
  if (manifest === null) return 'NONE';
  return /synthetic|test-fixture|fixture/i.test(`${manifest.provider} ${manifest.licence}`)
    ? 'SYNTHETIC_FIXTURE'
    : 'OPERATOR_SUPPLIED';
}

function periodTypeOf(period: NormalizedPeriod): 'ANNUAL' | 'QUARTERLY' | string {
  return period.period.periodType;
}

function sectorMeasurementFor(
  measurements: readonly SectorMeasurement[],
  sector: string,
): SectorMeasurement | undefined {
  return measurements.find((measurement) => measurement.sector === sector);
}

/**
 * Build the investment-coverage report.
 *
 * Deterministic for identical inputs. Every number is read from the supplied dataset; nothing is
 * estimated and no issuer is invented.
 */
export function buildInvestmentCoverageReport(input: InvestmentCoverageInput): InvestmentCoverageReport {
  const {
    asOf,
    generatedAt,
    manifest,
    issuers,
    securities,
    periods,
    prices,
    operatingMetrics,
    issues,
    identitySourcesAvailable,
    identitySourceDetail = null,
    issuerIdentityState = null,
  } = input;

  const manifestRef = manifest ?? null;
  const coverage = manifestRef?.coverage ?? null;

  // The sector measurement needs the same content shape `measureCoverage` consumes. It is derived
  // here from the supplied records, never from a second read of the store.
  const sectorReport: CoverageReport = measureCoverage(
    {
      issuers: [...issuers],
      securities: [...securities],
      listings: [],
      periods: [...periods],
      prices: [...prices],
      corporateActions: [],
      operatingMetrics: [...operatingMetrics],
      issues: [...issues],
    },
    { datasetVersion: manifestRef?.datasetVersion ?? 'NONE', generatedAt },
  );

  const securitiesByIssuer = new Map<string, SecurityRecord[]>();
  for (const security of securities) {
    const bucket = securitiesByIssuer.get(security.issuerId);
    if (bucket === undefined) securitiesByIssuer.set(security.issuerId, [security]);
    else bucket.push(security);
  }
  const pricesBySecurity = new Map<string, number>();
  for (const price of prices) {
    pricesBySecurity.set(price.securityId, (pricesBySecurity.get(price.securityId) ?? 0) + 1);
  }
  const metricsByIssuer = new Map<string, number>();
  for (const metric of operatingMetrics) {
    metricsByIssuer.set(metric.issuerId, (metricsByIssuer.get(metric.issuerId) ?? 0) + 1);
  }
  const issuesByIssuer = new Map<string, string[]>();
  for (const issue of issues) {
    const issuerId = issuerIdOfIssue(issue);
    if (issuerId === null) continue;
    const bucket = issuesByIssuer.get(issuerId);
    if (bucket === undefined) issuesByIssuer.set(issuerId, [issue.code]);
    else bucket.push(issue.code);
  }

  const rows: InvestmentCoverageIssuerRow[] = issuers
    .slice()
    .sort((a, b) => a.issuerId.localeCompare(b.issuerId))
    .map((issuer) => {
      const issuerPeriods = periods.filter((period) => period.issuerId === issuer.issuerId);
      const annualPeriods = issuerPeriods.filter((period) => periodTypeOf(period) === 'ANNUAL').length;
      const quarterlyPeriods = issuerPeriods.filter((period) => periodTypeOf(period) === 'QUARTERLY').length;
      const issuerSecurities = securitiesByIssuer.get(issuer.issuerId) ?? [];
      const priceCount = issuerSecurities.reduce(
        (total, security) => total + (pricesBySecurity.get(security.securityId) ?? 0),
        0,
      );
      const metricCount = metricsByIssuer.get(issuer.issuerId) ?? 0;
      const issueCodes = [...new Set(issuesByIssuer.get(issuer.issuerId) ?? [])].sort();
      const periodEnds = issuerPeriods
        .map((period) => period.period.periodEnd)
        .filter((end): end is string => typeof end === 'string' && end !== '')
        .sort();

      const measurement = sectorMeasurementFor(sectorReport.sectors, issuer.sector);
      const sectorMeasured =
        measurement !== undefined && measurement.stage !== 'G3_WITHHELD' && measurement.stage !== 'UNMEASURED';

      const state: InvestmentCoverageState =
        annualPeriods === 0 && quarterlyPeriods === 0
          ? 'NO_FINANCIALS'
          : issueCodes.length > 0
            ? 'ISSUED_DATA'
            : sectorMeasured
              ? 'COVERED'
              : 'SECTOR_NOT_MEASURED';

      /*
       * The identity dependency of this issuer.
       *
       * `issuerIdentityState === null` means the caller could not evaluate any identity binding at
       * all (the identity sources are absent) — that is "not evaluated". When the caller DID supply
       * the map, an issuer absent from it has no resolved binding, which is "UNRESOLVED". These are
       * different statements and must not collapse: an issuer missing from the map is NOT resolved.
       */
      const identityDependency =
        issuerIdentityState === null
          ? null
          : issuerIdentityState.get(issuer.issuerId) === 'RESOLVED'
            ? 'RESOLVED'
            : 'UNRESOLVED';

      return {
        issuerId: issuer.issuerId,
        legalName: issuer.legalName,
        sector: issuer.sector,
        subSegment: issuer.subSegment,
        reportingCurrency: issuer.reportingCurrency,
        fiscalYearEnd: issuer.fiscalYearEnd,
        state,
        annualPeriods,
        quarterlyPeriods,
        securities: issuerSecurities.length,
        prices: priceCount,
        operatingMetrics: metricCount,
        latestPeriodEnd: periodEnds.length > 0 ? periodEnds[periodEnds.length - 1] : null,
        earliestPeriodEnd: periodEnds.length > 0 ? periodEnds[0] : null,
        issueCodes,
        identityDependency,
        identityDependencyDetail:
          identityDependency === 'UNRESOLVED'
            ? 'This issuer has no resolved identity binding, so an identity-scoped assessment cannot be opened for it. The investment-coverage position above is the dataset\'s own and is unaffected.'
            : identityDependency === null
              ? 'The identity sources could not be loaded, so no identity binding could be evaluated for this issuer.'
              : null,
      };
    });

  const counts: Record<InvestmentCoverageState | 'observed', number> = {
    observed: rows.length,
    COVERED: 0,
    NO_FINANCIALS: 0,
    SECTOR_NOT_MEASURED: 0,
    ISSUED_DATA: 0,
  };
  for (const row of rows) counts[row.state] += 1;

  const datasetClass = financialClass(manifestRef);
  const financialCoverage = buildFinancialCoverageDisclosure({
    sectorReport,
    manifest: manifestRef,
    unmappedTagsObserved: issues
      .filter((issue) => issue.code === 'UNMAPPED_XBRL_TAG')
      .map((issue) => /tag "([^"]+)"/.exec(issue.detail)?.[1] ?? issue.detail),
  });

  const offVocabularyIssuers: readonly OffVocabularySectorIssuer[] = sectorReport.offVocabularyIssuers.map(
    (entry) => ({
      issuerId: entry.issuerId,
      legalName: entry.legalName,
      sectorAsWritten: entry.received,
      reason: entry.reason,
      canonicalSector: entry.suggestion?.sector ?? null,
      correction: entry.suggestion?.correction ?? null,
    }),
  );

  const statusLine = buildInvestmentCoverageStatusLine(rows, counts, sectorReport, datasetClass);

  const notes: string[] = [
    'Investment coverage describes what the served dataset holds. It is not identity coverage: a row here states the dataset position for an issuer, and says nothing about whether that issuer has a defensible security or listing.',
    'Identity coverage is a separate read. Where the identity sources could not be loaded, that is disclosed per row and in this report\'s identity disclosure — it never removes the investment-coverage position.',
  ];
  if (!identitySourcesAvailable) {
    notes.push(
      'The eligible roster, listing map and corporate-action table could not be loaded, so no identity binding could be evaluated for any issuer. The investment-coverage position above is the dataset\'s own and is unaffected.',
    );
  }
  if (datasetClass === 'NONE') {
    notes.push('No investment dataset is installed, so there is nothing to cover. This is a disclosed position, not a failure of this surface.');
  }
  if (offVocabularyIssuers.length > 0) {
    notes.push(
      `${offVocabularyIssuers.length} issuer(s) carry a sector that is not one of the ${sectorReport.sectors.length} canonical sector ` +
        `names, so they matched no sector and are excluded from every measurement: ` +
        `${offVocabularyIssuers.map((e) => `${e.legalName} (${e.sectorAsWritten})`).join(', ')}. ` +
        `The measured-sector count above therefore UNDERSTATES this dataset. Sector names are exact and case-sensitive and are never ` +
        `trimmed, case-folded or otherwise normalised here; correct the sector at source and re-ingest.`,
    );
  }

  return {
    reportVersion: 1,
    asOf,
    generatedAt,
    dataset: {
      datasetVersion: manifestRef?.datasetVersion ?? 'NONE',
      contentDigest: manifestRef?.contentDigest ?? '',
      provider: manifestRef?.provider ?? 'none',
      licence: manifestRef?.licence ?? 'none',
      dataAsOf: manifestRef?.dataAsOf ?? null,
      knownAsOf: manifestRef?.knownAsOf ?? null,
      lastImportAt: manifestRef?.lastImportAt ?? '',
      importRunId: manifestRef?.importRunId ?? '',
      quality: manifestRef?.quality ?? 'unavailable',
      completenessPct: manifestRef?.completenessPct ?? 0,
      datasetClass,
      issuers: coverage?.issuers ?? issuers.length,
      securities: coverage?.securities ?? securities.length,
      listings: coverage?.listings ?? 0,
      annualPeriods: coverage?.annualPeriods ?? 0,
      quarterlyPeriods: coverage?.quarterlyPeriods ?? 0,
      prices: coverage?.prices ?? prices.length,
      operatingMetricRecords: coverage?.operatingMetricRecords ?? operatingMetrics.length,
      corporateActions: coverage?.corporateActions ?? 0,
      earliestPeriodEnd: coverage?.earliestPeriodEnd ?? null,
      latestPeriodEnd: coverage?.latestPeriodEnd ?? null,
    },
    sectors: sectorReport.sectors,
    measuredSectors: sectorReport.completedMeasurements.length,
    totalSectors: sectorReport.sectors.length,
    outstandingSectors: [...sectorReport.outstandingSectors],
    offVocabularyIssuers,
    issuers: rows,
    counts,
    issues: issues.map((issue) => ({
      code: issue.code,
      subject: issue.subject,
      detail: issue.detail,
    })),
    financialCoverage,
    statusLine,
    notes,
    identitySourcesAvailable,
    identitySourceDetail,
  };
}

function buildInvestmentCoverageStatusLine(
  rows: readonly InvestmentCoverageIssuerRow[],
  counts: Readonly<Record<InvestmentCoverageState | 'observed', number>>,
  sectorReport: CoverageReport,
  datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE',
): string {
  if (rows.length === 0) {
    return datasetClass === 'NONE'
      ? 'No investment dataset is installed: no issuer is covered.'
      : 'The installed dataset declares no issuer: no issuer is covered.';
  }
  return (
    `${counts.COVERED} of ${counts.observed} issuer(s) covered; ` +
    `${counts.NO_FINANCIALS} without financials, ${counts.SECTOR_NOT_MEASURED} in an unmeasured sector, ` +
    `${counts.ISSUED_DATA} carrying an ingestion issue. ` +
    `${sectorReport.completedMeasurements.length} of ${sectorReport.sectors.length} sector(s) measured.` +
    (sectorReport.offVocabularyIssuers.length === 0
      ? ''
      : ` ${sectorReport.offVocabularyIssuers.length} issuer(s) excluded from measurement by an off-vocabulary sector.`)
  );
}

/** Best-effort extraction of the issuer an ingestion issue refers to. Never guesses. */
function issuerIdOfIssue(issue: IngestionIssue): string | null {
  const fromSubject = /\bIN:[A-Z]+:[^\s]+/.exec(issue.subject)?.[0];
  if (fromSubject !== undefined) return fromSubject;
  const fromDetail = /\bIN:[A-Z]+:[^\s]+/.exec(issue.detail)?.[0];
  if (fromDetail !== undefined) return fromDetail;
  return null;
}

export const INVESTMENT_COVERAGE_TAG_MAP_SIZE = Object.keys(XBRL_TAG_MAP).length;
export const INVESTMENT_COVERAGE_DERIVATION_COUNT = DERIVATIONS.length;
