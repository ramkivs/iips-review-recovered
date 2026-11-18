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
import { assessFreshness } from '../assessment/freshness';
import { selectSeries } from '../assessment/periods';
import { VALUATION_POLICY } from '../assessment/policy';
import { FRESHNESS_POLICY_VERSION } from '../assessment/types';
import { measureCoverage, qualificationOf, type CoverageReport, type SectorMeasurement } from './measure';
import { SECTOR_METHODS, type MethodRequirement } from './methodMatrix';
import type { DatasetContent } from '../fundamentals/types';
import type { InvalidSectorReason } from '../ingestion/sectorValidation';
import {
  buildFinancialCoverageDisclosure,
  type FinancialCoverageDisclosure,
} from '../identity/coverage';
import { DERIVATIONS } from '../fundamentals/derive';
import { classifyDataset, datasetClassStatement } from '../fundamentals/datasetClass';
import { authorizationReferenceStatement } from '../fundamentals/authorizationRecords';
import { XBRL_TAG_MAP } from '../ingestion/xbrl';
import {
  sourceRightsOf,
  type DatasetManifest,
  type SourceRightsDeclaration,
} from '../fundamentals/manifest';
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
  /**
   * `S4-R3` — statement freshness for this issuer's **assessed series**, measured at the report clock.
   *
   * Deliberately separate from `latestPeriodEnd` above, which is the newest period end across every scope and type
   * in the dataset. This block answers the two questions a reader actually has: how old is the period the valuation
   * would rest on (`valuationBasis`, the annual period) and how old is the newest information the filer has
   * published (`latestReported`, any type). `filedAt` is a publication date and never a period end; the age is
   * always measured from the period end, because `freshness-policy/1.0.0` measures statements and not filing lag.
   * `sequenceGapCount` is non-zero only when the series skips a fiscal year or a quarter — which counting periods
   * would never reveal.
   */
  readonly freshness: {
    readonly status: 'FRESH' | 'STALE' | 'UNKNOWN';
    readonly reasons: readonly string[];
    readonly valuationBasis: {
      readonly periodEnd: string;
      readonly periodType: 'ANNUAL' | 'QUARTER' | 'TTM';
      readonly filedAt: string;
      readonly daysSincePeriodEnd: number;
    } | null;
    readonly latestReported: {
      readonly periodEnd: string;
      readonly periodType: 'ANNUAL' | 'QUARTER' | 'TTM';
      readonly filedAt: string;
      readonly daysSincePeriodEnd: number;
    } | null;
    readonly windows: { readonly pnlDays: number; readonly balanceSheetDays: number };
    readonly policyVersion: string;
    readonly sequenceGapCount: number;
  };
  /**
   * `S4-R5` — HISTORICAL METHOD AVAILABILITY versus LATEST-PERIOD QUALIFICATION, for this issuer alone.
   *
   * The owner decision of `S4-R5` retains existential annual-period coverage semantics: a method is historically
   * `AVAILABLE` when at least ONE eligible (issuer, annual period) pair satisfies its declared inputs. That is a
   * statement about the dataset's history — it is NOT a statement that the latest period supports the method, and
   * it is NOT a statement that an assessment would produce a figure (see `S4-R4`).
   *
   * The three method lists below therefore keep the two questions apart, using the same predicate the measurement
   * uses (`qualificationOf` in `./measure`):
   *   `latestPeriodAvailable` — qualifies at the newest annual period on record;
   *   `earlierPeriodsOnly`    — qualifies on an earlier period but NOT at the newest one (historically available,
   *                             not latest-ready);
   *   `neverAvailable`        — no period qualifies; the measurement withholds it, and nothing here supplies a zero
   *                             or an older value in place of a missing input.
   * Nothing in this block feeds a valuation, a derived figure or a freshness decision; it is disclosure only.
   */
  readonly methodAvailability: {
    /** Why the lists are what they are: no sector methods for this issuer's sector, or no annual period at all. */
    readonly basis: 'SECTOR_METHODS' | 'NO_SECTOR_METHODS' | 'NO_ANNUAL_PERIODS';
    /** The newest annual period end in scope — the period a latest-period reading looks at. */
    readonly latestPeriodEnd: string | null;
    readonly annualPeriodsConsidered: number;
    /** The sector's PRIMARY method, stated both ways so the distinction is readable at a glance. */
    readonly primaryMethod: {
      readonly methodId: string;
      readonly historicallyAvailable: boolean;
      readonly availableAtLatestPeriod: boolean;
    } | null;
    readonly latestPeriodAvailable: readonly string[];
    readonly earlierPeriodsOnly: readonly string[];
    readonly neverAvailable: readonly string[];
  };
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
    readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE';
    readonly sourceRights?: SourceRightsDeclaration | null;
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
  /** `S4-R5` — the availability semantics in force for this report's method states. See the note above `sectors`. */
  readonly availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD';
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

/**
 * The coverage read model's class, derived from the assessment path's rule and from nothing else.
 *
 * WHY THIS IS A DELEGATION AND NOT ITS OWN RULE. Until `L-041` this function was a substring test on
 * `provider` + `licence` — the exact rule `fundamentals/datasetClass.ts` documents under "WHAT WAS WRONG"
 * and removes. The two classifiers therefore disagreed on the same committed manifests: the assessment
 * path answered `UNKNOWN` (fail-closed, because those manifests carry no rights evidence), while this one
 * answered `OPERATOR_SUPPLIED`, asserting an operator attestation that no manifest made. `L-041` recorded
 * the divergence, and §17.27 records its resolution on `W05-D1`. It is corrected by removing the second
 * implementation, not by reconciling two rules.
 *
 * The coverage vocabulary keeps its own names because consumers depend on them: `SYNTHETIC_FIXTURE` is the
 * read model's historical spelling of `SYNTHETIC_REFERENCE`, and `NONE` means no manifest was installed at
 * all — a different fact from "installed but its rights are not established". `UNKNOWN` is answerable here,
 * which is what the read model previously could not do: a fail-closed third state, distinct from `NONE`, so
 * an unestablished dataset no longer renders as either a fixture or an operator attestation.
 */
function financialClass(
  manifest: DatasetManifest | null,
): 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE' {
  if (manifest === null) return 'NONE';
  const classified = classifyDataset(manifest);
  switch (classified) {
    case 'SYNTHETIC_REFERENCE':
      return 'SYNTHETIC_FIXTURE';
    case 'OPERATOR_SUPPLIED':
      return 'OPERATOR_SUPPLIED';
    case 'UNKNOWN':
      return 'UNKNOWN';
  }
}

function periodTypeOf(period: NormalizedPeriod): 'ANNUAL' | 'QUARTER' | 'QUARTERLY' | string {
  return period.period.periodType;
}

function sectorMeasurementFor(
  measurements: readonly SectorMeasurement[],
  sector: string,
): SectorMeasurement | undefined {
  return measurements.find((measurement) => measurement.sector === sector);
}

/**
 * `S4-R3` — one issuer's freshness, from the same module the assessment uses.
 *
 * The series is selected with `selectSeries`, so this row describes exactly the series an assessment of the issuer
 * would consume (consolidated where available, restatements preferred) rather than a mix of scopes. The clock is the
 * report's own `asOf`, so the ages are reproducible from the report alone.
 */
function freshnessFor(
  issuerId: string,
  periods: readonly NormalizedPeriod[],
  clock: string,
): InvestmentCoverageIssuerRow['freshness'] {
  const block = assessFreshness({
    series: selectSeries(periods, issuerId),
    clock,
    windows: VALUATION_POLICY.freshness,
    policyVersion: FRESHNESS_POLICY_VERSION,
  });
  const brief = (period: typeof block.valuationBasis) =>
    period === null
      ? null
      : {
          periodEnd: period.periodEnd,
          periodType: period.periodType,
          filedAt: period.filedAt,
          daysSincePeriodEnd: period.daysSincePeriodEnd,
        };
  return {
    status: block.status,
    reasons: [...block.reasons],
    valuationBasis: brief(block.valuationBasis),
    latestReported: brief(block.latestReported),
    windows: { pnlDays: block.windows.pnlDays, balanceSheetDays: block.windows.balanceSheetDays },
    policyVersion: block.policyVersion,
    sequenceGapCount: block.sequenceGaps.length,
  };
}

/**
 * `S4-R5` — one issuer's historical-versus-latest method availability, from the measurement's own predicate.
 *
 * Both answers come from `qualificationOf`, so this row cannot disagree with the sector measurement about whether
 * an input set is satisfied. The recommendation is the sector's PRIMARY method only; a sector with no declared
 * methods (an off-vocabulary sector name, which the report already discloses separately) says so via `basis`.
 */
function methodAvailabilityFor(
  issuerId: string,
  sector: string,
  annualPeriods: readonly NormalizedPeriod[],
  content: DatasetContent,
): InvestmentCoverageIssuerRow['methodAvailability'] {
  const requirements: readonly MethodRequirement[] =
    (SECTOR_METHODS as Readonly<Record<string, readonly MethodRequirement[]>>)[sector] ?? [];
  if (requirements.length === 0) {
    return {
      basis: 'NO_SECTOR_METHODS',
      latestPeriodEnd: null,
      annualPeriodsConsidered: annualPeriods.length,
      primaryMethod: null,
      latestPeriodAvailable: [],
      earlierPeriodsOnly: [],
      neverAvailable: [],
    };
  }
  if (annualPeriods.length === 0) {
    // No annual period means nothing can qualify: every method is withheld, and the row says why rather than
    // reporting an empty (and therefore ambiguous) set of lists.
    const declaredPrimary = requirements.find((requirement) => requirement.role === 'PRIMARY');
    return {
      basis: 'NO_ANNUAL_PERIODS',
      latestPeriodEnd: null,
      annualPeriodsConsidered: 0,
      primaryMethod:
        declaredPrimary === undefined
          ? null
          : { methodId: declaredPrimary.methodId, historicallyAvailable: false, availableAtLatestPeriod: false },
      latestPeriodAvailable: [],
      earlierPeriodsOnly: [],
      neverAvailable: requirements.map((requirement) => requirement.methodId).sort(),
    };
  }

  const latestPeriodAvailable: string[] = [];
  const earlierPeriodsOnly: string[] = [];
  const neverAvailable: string[] = [];
  let latestPeriodEnd: string | null = null;
  let primaryMethod: InvestmentCoverageIssuerRow['methodAvailability']['primaryMethod'] = null;

  for (const requirement of requirements) {
    const summary = qualificationOf({
      requirement,
      issuerIds: [issuerId],
      annualPeriods,
      content,
    });
    if (summary.latestPeriod !== null) latestPeriodEnd = summary.latestPeriod.periodEnd;
    const historicallyAvailable = summary.qualifyingPeriods.length > 0;
    if (!historicallyAvailable) neverAvailable.push(requirement.methodId);
    else if (summary.latestPeriodQualified) latestPeriodAvailable.push(requirement.methodId);
    else earlierPeriodsOnly.push(requirement.methodId);
    if (requirement.role === 'PRIMARY' && primaryMethod === null) {
      primaryMethod = {
        methodId: requirement.methodId,
        historicallyAvailable,
        availableAtLatestPeriod: summary.latestPeriodQualified,
      };
    }
  }

  return {
    basis: 'SECTOR_METHODS',
    latestPeriodEnd,
    annualPeriodsConsidered: annualPeriods.length,
    primaryMethod,
    latestPeriodAvailable: latestPeriodAvailable.sort(),
    earlierPeriodsOnly: earlierPeriodsOnly.sort(),
    neverAvailable: neverAvailable.sort(),
  };
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
  const content: DatasetContent = {
    issuers: [...issuers],
    securities: [...securities],
    listings: [],
    periods: [...periods],
    prices: [...prices],
    corporateActions: [],
    operatingMetrics: [...operatingMetrics],
    issues: [...issues],
  };
  const sectorReport: CoverageReport = measureCoverage(content, {
    datasetVersion: manifestRef?.datasetVersion ?? 'NONE',
    generatedAt,
  });

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
      const quarterlyPeriods = issuerPeriods.filter(
        (period) => periodTypeOf(period) === 'QUARTER' || periodTypeOf(period) === 'QUARTERLY',
      ).length;
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
        freshness: freshnessFor(issuer.issuerId, periods, asOf),
        methodAvailability: methodAvailabilityFor(
          issuer.issuerId,
          issuer.sector,
          issuerPeriods.filter((period) => periodTypeOf(period) === 'ANNUAL'),
          content,
        ),
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
  const sourceRights = manifestRef === null ? null : sourceRightsOf(manifestRef);
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
  } else if (datasetClass === 'SYNTHETIC_FIXTURE') {
    notes.push(datasetClassStatement('SYNTHETIC_REFERENCE'));
  } else if (datasetClass === 'UNKNOWN') {
    notes.push(datasetClassStatement('UNKNOWN'));
  } else if (datasetClass === 'OPERATOR_SUPPLIED') {
    notes.push(datasetClassStatement('OPERATOR_SUPPLIED'));
  }
  // `W05`: a dataset whose declaration cites the operator's decision record says so, directly after the class
  // statement. The references were checked by `sourceRightsOf` above; a citation that did not check out threw
  // there and is never served. A dataset that cites no record gets no note, so its report is unchanged.
  if (sourceRights?.authorizationReferences !== undefined) {
    notes.push(authorizationReferenceStatement(sourceRights.authorizationReferences));
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

  /*
   * `S4-R5` — the reading instruction the report did not previously carry, appended LAST so every note already
   * published keeps its position. `usableMethods` and a sector stage are facts about the whole annual-period
   * history; they are neither a latest-period readiness statement nor a valuation.
   */
  notes.push(
    'Method availability is HISTORICAL, and existential over annual periods: a method is available when at least one eligible issuer and annual period carries every input it declares. It is not a statement that the latest period supports the method, and it is not a statement that an assessment would produce a figure. Each issuer row separates the two: `latestPeriodAvailable` (qualifies at the newest annual period), `earlierPeriodsOnly` (available historically, not at the newest period) and `neverAvailable` (no period qualifies). Missing, stale, incomplete or invalid latest inputs keep withholding or blocking; nothing is substituted with a zero or with an older value.',
  );

  return {
    reportVersion: 1,
    /**
     * `S4-R5` — a machine-readable statement of WHICH availability semantics this report was measured under, so a
     * reader (or a regression test) never has to infer it from prose. Existential over annual periods, retained by
     * owner decision; the value is a constant and changes only if that decision changes.
     */
    availabilitySemantics: 'EXISTENTIAL_ANNUAL_PERIOD' as const,
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
      sourceRights,
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
  datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN' | 'NONE',
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

/* ====================================================================================================== *
 * `S4-R4` — WHAT THIS READ MODEL'S COVERAGE FIELDS DO AND DO NOT SAY.
 *
 * `sectors[].usableMethods`, `financialCoverage.usableMethods` and the `G1_ENABLED` / `G2_PARTIAL` stage all
 * come from `measureCoverage` and describe the DATASET: which declared inputs are present for at least one
 * annual period of at least one issuer in the sector. They say nothing about whether the assessment would
 * produce a per-share valuation for any issuer at this `asOf`, and nothing about whether such a valuation
 * would be current. A coverage row and an assessment row answer different questions and are allowed to
 * disagree in either direction; `freshness` on the issuer row above is the third, separate question (age of
 * the valuation basis, `S4-R3`).
 *
 * `financialCoverage.derivationItems` and `xbrlMappedTags` are sizes of the CODE's vocabularies, not
 * measurements of this dataset.
 *
 * The full contract, with the measured examples and the reason vocabularies of both layers:
 *   docs/integration/IID-COVERAGE-USABLE-VERSUS-VALUATION-2026-11-17.md
 * ====================================================================================================== */
