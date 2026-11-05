/**
 * IID-0 — dataset manifest and identity.
 *
 * `datasetVersion` IS the content digest. The import timestamp is recorded but excluded from identity,
 * so re-importing identical content does not mint a new dataset version (design of record Part II §R-7).
 */
import type { IssuerRecord } from './types';
import { canonicalize, digestOf, sha256Hex } from './canonical';

export const DATASET_SCHEMA = 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const;

/** Explicit, auditable statement of what identity covers. */
export const DIGEST_SCOPE = Object.freeze({
  included: Object.freeze([
    'issuers',
    'securities',
    'listings',
    'periods',
    'prices',
    'corporateActions',
    'operatingMetrics',
    'issues',
  ]),
  excluded: Object.freeze([
    'lastImportAt',
    'importRunId',
    'inputFileNames',
    'fileOrder',
    'fileMtimes',
    'elapsedMillis',
  ]),
});

export interface DatasetCoverage {
  readonly issuers: number;
  readonly securities: number;
  readonly listings: number;
  readonly annualPeriods: number;
  readonly quarterlyPeriods: number;
  readonly earliestPeriodEnd: string | null;
  readonly latestPeriodEnd: string | null;
  readonly operatingMetricRecords: number;
  readonly corporateActions: number;
  readonly prices: number;
}

export interface DatasetManifest {
  readonly datasetSchema: typeof DATASET_SCHEMA;
  /** Identity. Equal to `contentDigest`; carries no timestamp. */
  readonly datasetVersion: string;
  readonly contentDigest: string;
  readonly provider: string;
  readonly licence: string;
  readonly dataAsOf: string | null;
  readonly knownAsOf: string | null;
  /** Recorded for audit only — NOT part of identity. */
  readonly lastImportAt: string;
  readonly importRunId: string;
  readonly quality: 'good' | 'stale' | 'partial' | 'unavailable';
  readonly completenessPct: number;
  readonly coverage: DatasetCoverage;
  readonly digestScope: typeof DIGEST_SCOPE;
  /** Relative path → sha256 of the exact bytes written, for tamper detection. */
  readonly files: Readonly<Record<string, string>>;
}

export interface DigestableContent {
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly unknown[];
  readonly listings: readonly unknown[];
  readonly periods: readonly unknown[];
  readonly prices: readonly unknown[];
  readonly corporateActions: readonly unknown[];
  readonly operatingMetrics: readonly unknown[];
  readonly issues: readonly unknown[];
}

/** Content digest over the included members only. Deterministic and order-insensitive per member set. */
export function computeContentDigest(content: DigestableContent): string {
  const scoped: Record<string, unknown> = {};
  for (const key of DIGEST_SCOPE.included) {
    const value = (content as unknown as Record<string, unknown>)[key];
    scoped[key] = Array.isArray(value) ? sortForDigest(value) : value;
  }
  return digestOf(scoped);
}

/** Sort records by their canonical form so input ordering cannot change identity. */
function sortForDigest(values: readonly unknown[]): readonly string[] {
  return values.map((value) => canonicalize(value)).sort();
}

export function buildManifest(
  content: DigestableContent,
  options: {
    readonly provider: string;
    readonly licence: string;
    readonly now: string;
    readonly importRunId: string;
    readonly files: Readonly<Record<string, string>>;
    readonly quality?: DatasetManifest['quality'];
  },
): DatasetManifest {
  const contentDigest = computeContentDigest(content);
  const periods = content.periods as readonly { period: { periodType: string; periodEnd: string } }[];
  const annual = periods.filter((p) => p.period.periodType === 'ANNUAL').length;
  const quarterly = periods.filter((p) => p.period.periodType === 'QUARTER').length;
  const periodEnds = periods.map((p) => p.period.periodEnd).sort();
  const coverage: DatasetCoverage = {
    issuers: content.issuers.length,
    securities: content.securities.length,
    listings: content.listings.length,
    annualPeriods: annual,
    quarterlyPeriods: quarterly,
    earliestPeriodEnd: periodEnds.length > 0 ? periodEnds[0]! : null,
    latestPeriodEnd: periodEnds.length > 0 ? periodEnds[periodEnds.length - 1]! : null,
    operatingMetricRecords: content.operatingMetrics.length,
    corporateActions: content.corporateActions.length,
    prices: content.prices.length,
  };
  const dataAsOf = coverage.latestPeriodEnd;
  const knownAsOf = periodEnds.length > 0 ? options.now : null;
  const errorCount = (content.issues as readonly { severity: string }[]).filter(
    (issue) => issue.severity === 'ERROR',
  ).length;
  return {
    datasetSchema: DATASET_SCHEMA,
    datasetVersion: contentDigest,
    contentDigest,
    provider: options.provider,
    licence: options.licence,
    dataAsOf,
    knownAsOf,
    lastImportAt: options.now,
    importRunId: options.importRunId,
    quality: options.quality ?? (errorCount > 0 ? 'partial' : 'good'),
    completenessPct: completenessOf(content),
    coverage,
    digestScope: DIGEST_SCOPE,
    files: options.files,
  };
}

/** Share of the closed line-item set populated across annual periods, 1 dp. */
export function completenessOf(content: DigestableContent): number {
  const periods = content.periods as readonly { values: Record<string, unknown> }[];
  const annual = periods.filter((p) => (p as unknown as { period: { periodType: string } }).period.periodType === 'ANNUAL');
  if (annual.length === 0) return 0;
  let populated = 0;
  for (const period of annual) {
    for (const value of Object.values(period.values)) {
      const observation = value as { presence?: string; value?: unknown };
      if ((observation.presence === 'PRESENT' || observation.presence === 'IMPUTED') && observation.value !== null) {
        populated += 1;
      }
    }
  }
  const expected = annual.length * 20;
  return Math.min(100, Math.round((populated / expected) * 1000) / 10);
}

export interface IntegrityResult {
  readonly ok: boolean;
  readonly mismatches: readonly { readonly file: string; readonly expected: string; readonly actual: string }[];
  readonly digestOk: boolean;
  readonly recomputedDigest: string;
}

/** Verify both the per-file digests and the content digest. Fails closed. */
export function verifyManifest(
  manifest: DatasetManifest,
  files: Readonly<Record<string, string>>,
  content: DigestableContent,
): IntegrityResult {
  const mismatches: { file: string; expected: string; actual: string }[] = [];
  for (const [file, expected] of Object.entries(manifest.files)) {
    const actual = files[file];
    if (actual === undefined) {
      mismatches.push({ file, expected, actual: '<missing>' });
      continue;
    }
    if (actual !== expected) mismatches.push({ file, expected, actual });
  }
  const recomputedDigest = computeContentDigest(content);
  return {
    ok: mismatches.length === 0 && recomputedDigest === manifest.contentDigest,
    mismatches,
    digestOk: recomputedDigest === manifest.contentDigest,
    recomputedDigest,
  };
}

export function sha256OfText(text: string): string {
  return sha256Hex(text);
}
