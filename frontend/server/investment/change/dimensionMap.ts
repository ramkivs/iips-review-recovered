/**
 * IID-5 — the declared semantic dimension map (design §A3.3, roadmap task 1).
 *
 * WHAT A DIMENSION IS. A named investment fact with a declared location in the canonical payload, a declared
 * TYPE (additive value, ratio, ordinal, nominal, presence), a declared UNIT and a declared materiality rule.
 * Comparison walks this map; it never walks the payload looking for differences.
 *
 * WHY THAT MATTERS. A structural diff would report a key reordering, a re-serialisation, a float formatting
 * change or a newly-included optional field as a change. Those are noise, and the design's acceptance rule
 * (AC-5.7) is that they produce ZERO items. Only a declared dimension can produce an item, so noise is
 * impossible by construction rather than filtered afterwards.
 *
 * PATHS ARE THE REPORTED IDENTITY. Each spec carries both a `path` (published in the report, so a reader can
 * find the fact in the payload) and the same string is used to READ the fact — one string, one meaning, no
 * second accessor that could drift from the label.
 *
 * EIGHT CATEGORIES, NOT SEVEN. `IDENTITY_MAPPING` is included because without it a re-mapping presents as a
 * fundamental collapse — the single most misleading thing this report could say (design §A3.1).
 */
import { resolvePath } from '../../../../iips-platform/src/investment/assessment/engine.js';

/** The closed category set (design §A3.1). */
export const CHANGE_CATEGORIES = Object.freeze([
  'FUNDAMENTAL',
  'MARKET_VALUATION',
  'RISK_QUALITY',
  'DISPOSITION',
  'PORTFOLIO',
  'DATA_CORRECTION_RESTATEMENT',
  'MODEL',
  'IDENTITY_MAPPING',
] as const);
export type ChangeCategory = (typeof CHANGE_CATEGORIES)[number];

/** Declared dimension types (design R-13). */
export const DIMENSION_TYPES = Object.freeze([
  'ADDITIVE',
  'RATIO',
  'ORDINAL',
  'NOMINAL',
  'PRESENCE',
  'SET',
] as const);
export type DimensionType = (typeof DIMENSION_TYPES)[number];

export type ThresholdName =
  | 'reportedValue'
  | 'intrinsicValue'
  | 'rateInBasisPoints'
  | 'multiple'
  | 'percentagePoints'
  | 'confidence'
  | 'declared';

interface SpecBase {
  /** Stable identifier published in change items. Renaming it is a report-format change. */
  readonly id: string;
  /** Dotted path into the canonical payload. Also the value's reader. */
  readonly path: string;
  readonly label: string;
  readonly category: ChangeCategory;
}

export interface NumericDimensionSpec extends SpecBase {
  readonly kind: 'NUMERIC';
  /** `PRESENCE` means the path resolves to an `Observation` and its presence is compared first. */
  readonly type: 'ADDITIVE' | 'RATIO' | 'PRESENCE';
  readonly unit: string;
  readonly thresholds: ThresholdName;
}

export interface DeclaredDimensionSpec extends SpecBase {
  readonly kind: 'DECLARED';
  readonly type: 'ORDINAL' | 'NOMINAL';
  /** Ordinal scale, least → greatest. Absent for nominal dimensions. */
  readonly scale?: readonly string[];
  /**
   * Declared direction for a transition, when the scale's own order does not express it. Staleness and dividend
   * coverage both have scales whose arithmetic order runs OPPOSITE to investment direction: later on the scale
   * is worse, not better. Declaring the direction prevents a report from saying an assessment improved because
   * its statements went stale.
   */
  readonly directionOf?: (from: string | null, to: string | null) => 'IMPROVED' | 'WORSENED' | 'INDETERMINATE';
  /**
   * Declared level for a transition. Given the `from`/`to` labels (either may be `null` when absent), return the
   * materiality level. Every transition is declared: nothing is left to arithmetic.
   */
  readonly transition: (from: string | null, to: string | null) => DeclaredLevel;
}

export interface SetDimensionSpec extends SpecBase {
  readonly kind: 'SET';
  readonly type: 'SET';
  /** Extract comparable keys (and their severity, when the member carries one) from the resolved array. */
  readonly keyOf: (value: unknown) => readonly SetEntry[];
}

export interface SetEntry {
  readonly key: string;
  /** Declared severity for members that carry one; `null` when the member has no severity concept. */
  readonly severity: number | null;
}

export type DimensionSpec = NumericDimensionSpec | DeclaredDimensionSpec | SetDimensionSpec;

/** Levels a declared transition may return. Declared dimensions never use numeric thresholds. */
export type DeclaredLevel = 'IMMATERIAL' | 'NOTABLE' | 'MATERIAL' | 'CRITICAL';

/* ------------------------------------------------------------------ declared transition helpers ------- */

const ORDINAL = (scale: readonly string[], from: string | null, to: string | null): number | null => {
  const fromIndex = from === null ? null : scale.indexOf(from);
  const toIndex = to === null ? null : scale.indexOf(to);
  if (fromIndex === null || toIndex === null || fromIndex < 0 || toIndex < 0) return null;
  return toIndex - fromIndex;
};

/** Any change is NOTABLE; moving down the scale is MATERIAL; the declared worst value is CRITICAL. */
function ordinalRule(scale: readonly string[], options?: { readonly worst?: string; readonly downgradeIsMaterial?: boolean }) {
  return (from: string | null, to: string | null): DeclaredLevel => {
    if (from === to) return 'IMMATERIAL';
    const delta = ORDINAL(scale, from, to);
    if (options?.worst !== undefined && to === options.worst && from !== options.worst) return 'CRITICAL';
    if (delta !== null && delta < 0 && (options?.downgradeIsMaterial ?? true)) return 'MATERIAL';
    return 'NOTABLE';
  };
}

const anyChangeNotable = (from: string | null, to: string | null): DeclaredLevel =>
  from === to ? 'IMMATERIAL' : 'NOTABLE';

const staleBeyondRule = (from: string | null, to: string | null): DeclaredLevel => {
  if (from === to) return 'IMMATERIAL';
  // Crossing INTO staleness downgrades the assessment's confidence in its own inputs: that is material.
  if (to === 'true') return 'MATERIAL';
  return 'NOTABLE';
};

const adequacyRule = (from: string | null, to: string | null): DeclaredLevel => {
  if (from === to) return 'IMMATERIAL';
  if (to === 'INSUFFICIENT') return 'CRITICAL';
  const scale = ['INSUFFICIENT', 'PARTIAL', 'SUFFICIENT'];
  const delta = ORDINAL(scale, from, to);
  return delta !== null && delta < 0 ? 'MATERIAL' : 'NOTABLE';
};

const dividendVerdictRule = (from: string | null, to: string | null): DeclaredLevel => {
  if (from === to) return 'IMMATERIAL';
  if (to === 'UNCOVERED') return 'CRITICAL';
  if (from === 'COVERED' && (to === 'STRETCHED' || to === 'UNCOVERED')) return 'MATERIAL';
  return 'NOTABLE';
};

const dispositionVerbRule = (from: string | null, to: string | null): DeclaredLevel => {
  if (from === to) return 'IMMATERIAL';
  // A movement INTO a do-not-hold verb is critical; any other verb change is material (design §A3.4).
  if (to === 'AVOID' || to === 'AVOID_CANDIDATE') return 'CRITICAL';
  return 'MATERIAL';
};

const modelIdentityRule = (from: string | null, to: string | null): DeclaredLevel =>
  from === to ? 'IMMATERIAL' : 'MATERIAL';

/* ------------------------------------------------------------------ the map ----------------------------- */

const numeric = (
  id: string,
  path: string,
  label: string,
  category: ChangeCategory,
  type: NumericDimensionSpec['type'],
  unit: string,
  thresholds: ThresholdName,
): NumericDimensionSpec => Object.freeze({ kind: 'NUMERIC', id, path, label, category, type, unit, thresholds });

const declared = (
  id: string,
  path: string,
  label: string,
  category: ChangeCategory,
  type: DeclaredDimensionSpec['type'],
  transition: DeclaredDimensionSpec['transition'],
  scale?: readonly string[],
  directionOf?: DeclaredDimensionSpec['directionOf'],
): DeclaredDimensionSpec =>
  Object.freeze({
    kind: 'DECLARED',
    id,
    path,
    label,
    category,
    type,
    transition,
    ...(scale ? { scale } : {}),
    ...(directionOf ? { directionOf } : {}),
  });

const setOf = (
  id: string,
  path: string,
  label: string,
  category: ChangeCategory,
  keyOf: SetDimensionSpec['keyOf'],
): SetDimensionSpec => Object.freeze({ kind: 'SET', id, path, label, category, type: 'SET', keyOf });

const flagEntries = (value: unknown): readonly SetEntry[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code : JSON.stringify(entry);
    const severity = record.severity === 'HIGH' ? 4 : record.severity === 'MEDIUM' ? 3 : record.severity === 'LOW' ? 2 : null;
    return { key: code, severity };
  });
};

const riskFactorEntries = (value: unknown): readonly SetEntry[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    const key = typeof record.factorId === 'string' ? record.factorId : typeof record.code === 'string' ? record.code : JSON.stringify(entry);
    const severity = typeof record.severity === 'number' ? record.severity : null;
    return { key, severity };
  });
};

const restatementEntries = (value: unknown): readonly SetEntry[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    return {
      key: `${String(record.periodEnd ?? '')}:${String(record.field ?? '')}`,
      severity: null,
    };
  });
};

const methodEntries = (value: unknown): readonly SetEntry[] => {
  const selection = (value ?? {}) as Record<string, unknown>;
  const considered = Array.isArray(selection.considered) ? selection.considered : [];
  return considered.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    return { key: `${String(record.methodId ?? 'unknown')}`, severity: null };
  });
};

/**
 * Assessment dimensions. Every one of these is read from the canonical payload by path.
 *
 * Deliberately NOT dimensioned: `data.datasetVersion`, `data.contentDigest`, `asOf.dataAsOf`, `asOf.knownAsOf`.
 * They describe the *dataset* a version was built from, not investment facts; they are reported in the
 * comparison's provenance block, so a dataset refresh that changes nothing substantive does not read as a
 * change (AC-5.10 — re-pointing a dataset must not rewrite what an old diff says).
 */
export const ASSESSMENT_DIMENSIONS: readonly DimensionSpec[] = Object.freeze([
  // ---- FUNDAMENTAL (additive reported values and declared trends) ----
  numeric('fundamentals.revenue', 'fundamentals.annual[0].values.REVENUE_FROM_OPERATIONS', 'Revenue (latest annual)', 'FUNDAMENTAL', 'PRESENCE', 'INR', 'reportedValue'),
  numeric('fundamentals.pat', 'fundamentals.annual[0].values.NET_PROFIT_ATTRIBUTABLE_TO_OWNERS', 'Profit after tax (latest annual)', 'FUNDAMENTAL', 'PRESENCE', 'INR', 'reportedValue'),
  numeric('fundamentals.ocf', 'fundamentals.annual[0].values.OPERATING_CASH_FLOW', 'Operating cash flow (latest annual)', 'FUNDAMENTAL', 'PRESENCE', 'INR', 'reportedValue'),
  numeric('fundamentals.eps', 'fundamentals.annual[0].values.EPS_DILUTED', 'Diluted EPS (latest annual)', 'FUNDAMENTAL', 'PRESENCE', 'INR/share', 'reportedValue'),
  numeric('fundamentals.equity', 'fundamentals.annual[0].values.TOTAL_EQUITY', 'Total equity (latest annual)', 'FUNDAMENTAL', 'PRESENCE', 'INR', 'reportedValue'),
  numeric('fundamentals.revenueCagr3y', 'fundamentals.trends.revenueCagr3y', 'Revenue CAGR (3y)', 'FUNDAMENTAL', 'PRESENCE', 'fraction', 'rateInBasisPoints'),
  numeric('fundamentals.patCagr3y', 'fundamentals.trends.patCagr3y', 'PAT CAGR (3y)', 'FUNDAMENTAL', 'PRESENCE', 'fraction', 'rateInBasisPoints'),

  // ---- MARKET_VALUATION (price-derived) ----
  numeric('valuation.intrinsicMid', 'valuation.intrinsic.perShare.mid', 'Intrinsic value per share (mid)', 'MARKET_VALUATION', 'PRESENCE', 'INR/share', 'intrinsicValue'),
  numeric('valuation.mosVsMid', 'valuation.marginOfSafety.mosVsMid', 'Margin of safety vs intrinsic mid', 'MARKET_VALUATION', 'PRESENCE', 'fraction', 'percentagePoints'),
  numeric('valuation.price', 'valuation.marginOfSafety.price', 'Admissible market price', 'MARKET_VALUATION', 'PRESENCE', 'INR/share', 'reportedValue'),
  declared('valuation.mosBand', 'valuation.marginOfSafety.band', 'Margin-of-safety band', 'MARKET_VALUATION', 'NOMINAL', anyChangeNotable),

  // ---- RISK_QUALITY ----
  declared('quality.verdict', 'quality.verdict', 'Quality verdict', 'RISK_QUALITY', 'ORDINAL', ordinalRule(['UNVERIFIED', 'MATERIAL_CONCERNS', 'MINOR_CONCERNS', 'CLEAN'], { worst: 'UNVERIFIED' }), ['UNVERIFIED', 'MATERIAL_CONCERNS', 'MINOR_CONCERNS', 'CLEAN']),
  setOf('quality.flags', 'quality.flags', 'Quality flags', 'RISK_QUALITY', flagEntries),
  declared('completeness.adequacy', 'completeness.adequacy', 'Evidence adequacy', 'RISK_QUALITY', 'ORDINAL', adequacyRule, ['INSUFFICIENT', 'PARTIAL', 'SUFFICIENT']),
  declared('moat.classification', 'moat.classification', 'Moat classification', 'RISK_QUALITY', 'ORDINAL', ordinalRule(['NONE', 'NARROW', 'WIDE'], { worst: 'NONE' }), ['NONE', 'NARROW', 'WIDE']),
  // Confidence is a RATIO in 0..1, compared in percentage points of confidence (design §A3.4) — never as a
  // relative change, because "5 % more confident" is not a meaningful statement about a probability.
  numeric('confidence.combined', 'confidence.combined', 'Combined confidence', 'RISK_QUALITY', 'RATIO', 'fraction', 'confidence'),
  // Coverage is reported because a completeness change that leaves the verdict alone is still a change in what
  // the assessment could support, and hiding it inside the verdict would be a silent narrowing.
  numeric('coverage.requiredFieldPct', 'completeness.requiredFieldCoveragePct', 'Required-field coverage', 'RISK_QUALITY', 'PRESENCE', '%', 'percentagePoints'),
  declared('risk.aggregate', 'risk.aggregate.presence', 'Risk aggregate availability', 'RISK_QUALITY', 'NOMINAL', anyChangeNotable),
  setOf('risk.factors', 'risk.factors', 'Risk factors', 'RISK_QUALITY', riskFactorEntries),
  declared(
    'asOf.staleBeyondPolicy',
    'asOf.staleBeyondPolicy',
    'Statement freshness beyond policy',
    'RISK_QUALITY',
    'ORDINAL',
    staleBeyondRule,
    ['false', 'true'],
    (from, to) => (from === to ? 'INDETERMINATE' : to === 'true' ? 'WORSENED' : 'IMPROVED'),
  ),
  declared(
    'dividends.verdict',
    'dividends.verdict',
    'Dividend verdict',
    'RISK_QUALITY',
    'ORDINAL',
    dividendVerdictRule,
    ['COVERED', 'STRETCHED', 'UNCOVERED'],
    (from, to) => {
      if (from === to) return 'INDETERMINATE';
      const rank = (value: string | null) => (value === 'COVERED' ? 0 : value === 'STRETCHED' ? 1 : value === 'UNCOVERED' ? 2 : -1);
      return rank(to) > rank(from) ? 'WORSENED' : 'IMPROVED';
    },
  ),

  // ---- DATA_CORRECTION_RESTATEMENT ----
  setOf('data.restatements', 'data.restatements', 'Restated line items', 'DATA_CORRECTION_RESTATEMENT', restatementEntries),

  // ---- MODEL ----
  declared('model.version', 'artifact.modelVersion', 'Assessment model version', 'MODEL', 'NOMINAL', modelIdentityRule),
  declared('model.policy', 'artifact.policyVersion', 'Valuation policy version', 'MODEL', 'NOMINAL', modelIdentityRule),
  declared('model.methodSelection', 'valuation.methodSelection', 'Applicable method set', 'MODEL', 'NOMINAL', anyChangeNotable),
  setOf('model.applicableMethods', 'valuation.methodSelection', 'Applicable methods', 'MODEL', methodEntries),

  // ---- IDENTITY_MAPPING ----
  declared('identity.issuer', 'subject.issuerId', 'Issuer identity', 'IDENTITY_MAPPING', 'NOMINAL', modelIdentityRule),
  declared('identity.roster', 'subject.identity.rosterVersion', 'Identity roster version', 'IDENTITY_MAPPING', 'NOMINAL', anyChangeNotable),
  declared('identity.listingMap', 'subject.identity.listingMapVersion', 'Listing-map version', 'IDENTITY_MAPPING', 'NOMINAL', anyChangeNotable),
  declared('identity.corporateActions', 'subject.identity.corporateActionTableVersion', 'Corporate-action table version', 'IDENTITY_MAPPING', 'NOMINAL', anyChangeNotable),
  declared('identity.sector', 'subject.sector', 'Sector classification', 'IDENTITY_MAPPING', 'NOMINAL', anyChangeNotable),
] as const);

/** Disposition dimensions (the `hd:`/`hc:` payload). */
export const DISPOSITION_DIMENSIONS: readonly DimensionSpec[] = Object.freeze([
  declared('disposition.verb', 'disposition.verb', 'Disposition verb', 'DISPOSITION', 'ORDINAL', dispositionVerbRule, ['AVOID', 'REDUCE', 'RETAIN', 'ACCUMULATE', 'INITIATE']),
  numeric('disposition.confidence', 'disposition.confidence', 'Disposition confidence', 'DISPOSITION', 'ADDITIVE', 'fraction', 'confidence'),
  declared('disposition.adequacy', 'disposition.adequacy', 'Disposition evidence adequacy', 'DISPOSITION', 'ORDINAL', adequacyRule, ['INSUFFICIENT', 'PARTIAL', 'SUFFICIENT']),
  declared('disposition.policy', 'disposition.policyVersion', 'Disposition policy version', 'MODEL', 'NOMINAL', modelIdentityRule),
  declared('limits.policy', 'limits.policyVersion', 'Limits policy version', 'MODEL', 'NOMINAL', modelIdentityRule),
  setOf('disposition.gates', 'disposition.gates', 'Gate outcomes', 'DISPOSITION', (value) => {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => {
      const record = (entry ?? {}) as Record<string, unknown>;
      return { key: `${String(record.gateId ?? 'gate')}:${String(record.outcome ?? record.status ?? '')}`, severity: null };
    });
  }),
  numeric('portfolio.companyExposurePct', 'portfolioContext.companyExposurePct', 'Company exposure', 'PORTFOLIO', 'PRESENCE', '%', 'percentagePoints'),
  numeric('portfolio.weightPct', 'portfolioContext.weightPct', 'Position weight', 'PORTFOLIO', 'PRESENCE', '%', 'percentagePoints'),
  numeric('portfolio.sectorExposurePct', 'portfolioContext.sectorExposurePct', 'Sector exposure', 'PORTFOLIO', 'PRESENCE', '%', 'percentagePoints'),
  declared('portfolio.concentrationBand', 'portfolioContext.concentrationBand', 'Concentration band', 'PORTFOLIO', 'NOMINAL', anyChangeNotable),
  declared('portfolio.revision', 'portfolioContext.portfolioRevision', 'Portfolio revision', 'PORTFOLIO', 'NOMINAL', anyChangeNotable),
  declared('disposition.assessmentVersion', 'companyAssessmentRef.artifactVersion', 'Assessment version cited', 'DISPOSITION', 'NOMINAL', anyChangeNotable),
] as const);

export const DIMENSIONS_BY_REPORT_TYPE = Object.freeze({
  'investment.company-assessment': ASSESSMENT_DIMENSIONS,
  'investment.holding-disposition': DISPOSITION_DIMENSIONS,
} as const);

export function dimensionsFor(reportType: unknown): readonly DimensionSpec[] {
  if (reportType === 'investment.company-assessment') return ASSESSMENT_DIMENSIONS;
  if (reportType === 'investment.holding-disposition') return DISPOSITION_DIMENSIONS;
  throw new Error(`no dimension map for report type ${String(reportType)}`);
}

/** Read a dimension from a payload. A path that does not resolve yields `undefined`, never a default value. */
export function readDimension(payload: unknown, spec: DimensionSpec): unknown {
  if (spec.kind === 'DECLARED' && spec.path === 'risk.aggregate.presence') {
    const aggregate = resolvePath(payload, 'risk.aggregate');
    if (aggregate === null || typeof aggregate !== 'object') return null;
    const presence = (aggregate as Record<string, unknown>).presence;
    return typeof presence === 'string' ? presence : null;
  }
  return resolvePath(payload, spec.path);
}

/**
 * The dimensions whose change is a CONSEQUENCE of crossing the freshness window rather than an independent
 * fact. Used to classify a pair as `FRESHNESS_TRANSITION` (decision §6.5) instead of claiming a data change.
 */
export const FRESHNESS_CONSEQUENCE_DIMENSIONS: ReadonlySet<string> = new Set([
  'asOf.staleBeyondPolicy',
  'quality.verdict',
  'quality.flags',
  'completeness.adequacy',
  'dividends.verdict',
  // Confidence is a DECLARED consequence of freshness: the STALE_DATA cap multiplies it. Measured on the
  // decision's own C4 → C1 pair (confidence 0.8371 → 0.674, all four items RISK_QUALITY), omitting it made that
  // pair classify as SUBSTANTIVE and failed AC-L14.4.
  'confidence.combined',
]);
