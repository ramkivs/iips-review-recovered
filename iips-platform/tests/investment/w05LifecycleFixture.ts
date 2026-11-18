/**
 * W05 lifecycle test fixtures — synthetic period, rights and catalog builders.
 *
 * Everything here is SYNTHETIC and declares itself so: the fixtures prove lifecycle mechanics
 * (reuse, rights fail-closed behaviour, qualification gates, reporting denominators) and nothing
 * about real-company coverage. No fixture carries a real issuer's data and no fixture invents a
 * value for one.
 */
import type { LineItemId } from '../../src/investment/contracts/lineItems';
import { present, missing, nilByDisclosure, type NumericObservation } from '../../src/investment/contracts/observation';
import type { PeriodIdentity, QuarterForm, StatementScope } from '../../src/investment/contracts/period';
import type { IngestionIssue, NormalizedPeriod } from '../../src/investment/fundamentals/types';
import type { DatasetSchema } from '../../src/investment/contracts/lineItems';
import { buildRightsRecord, type DatasetRightsRecord, type PermissionState } from '../../src/investment/lifecycle/rightsRecord';
import type { DatasetCatalogEntry, DatasetSourceRecord } from '../../src/investment/lifecycle/issuerLifecycle';

export const SOURCE = Object.freeze({ kind: 'FILING' as const, ref: 'w05-synthetic-fixture' });

/** The issuer ids the IID-1 identity fixture roster resolves to (synthetic companies). */
export const ISSUER_A = 'IN:CIN:L72200KA1981PLC013115'; // Aarav Systems (synthetic) — ISIN IN0000000011
export const ISSUER_B = 'IN:CIN:U72200TN2001PLC000005'; // Bodhi Digital (synthetic) — ISIN IN0000000029
export const ISSUER_C = 'IN:CIN:L65110MH1995PLC000002'; // Chandra Meridian Bank (synthetic) — ISIN IN0000000037
export const ISSUER_D = 'IN:EQISIN:IN0000000045'; // Dwarka Resorts (synthetic) — ISIN IN0000000045
export const ISSUER_E = 'IN:CIN:U66010MH2000PLC000004'; // Eesha Life Insurance (synthetic) — ISIN IN0000000052

export const SCHEMA_V1: DatasetSchema = 'IIPS_INVESTMENT_FUNDAMENTALS_V1';

/** All nine required items present with a non-zero value. */
export function completeItems(overrides: Partial<Record<LineItemId, NumericObservation>> = {}): Partial<Record<LineItemId, NumericObservation>> {
  const items: Partial<Record<LineItemId, NumericObservation>> = {
    REVENUE_FROM_OPERATIONS: present(1000, SOURCE),
    EBITDA: present(250, SOURCE),
    NET_PROFIT: present(120, SOURCE),
    NET_PROFIT_ATTRIBUTABLE_TO_OWNERS: present(110, SOURCE),
    TOTAL_EQUITY: present(900, SOURCE),
    TOTAL_ASSETS: present(1800, SOURCE),
    OPERATING_CASH_FLOW: present(140, SOURCE),
    CAPITAL_EXPENDITURE: present(-60, SOURCE),
    EPS_DILUTED: present(12.5, SOURCE),
  };
  return { ...items, ...overrides };
}

export interface PeriodOptions {
  readonly scope?: StatementScope;
  readonly basis?: 'AS_FILED' | 'RESTATED';
  readonly restatementOf?: string | null;
  readonly filedAt?: string;
  readonly filingRef?: string;
  readonly quarterForm?: QuarterForm;
  readonly quarterIndex?: number;
  readonly derived?: Partial<Record<LineItemId, NumericObservation>>;
  readonly taxonomy?: string;
}

function identityOf(periodType: 'ANNUAL' | 'QUARTER', fiscalYear: number, periodStart: string, periodEnd: string, scope: StatementScope, options: PeriodOptions): PeriodIdentity {
  return {
    fiscalYear,
    periodType,
    periodStart,
    periodEnd,
    statementScope: scope,
    ...(periodType === 'QUARTER' ? { quarterForm: options.quarterForm ?? 'DISCRETE', quarterIndex: options.quarterIndex ?? 1 } : {}),
  };
}

/** One synthetic annual period (fiscal year ending 31 March). */
export function annualPeriod(
  issuerId: string,
  fiscalYear: number,
  items: Partial<Record<LineItemId, NumericObservation>>,
  options: PeriodOptions = {},
): NormalizedPeriod {
  const scope = options.scope ?? 'CONSOLIDATED';
  return {
    issuerId,
    period: identityOf('ANNUAL', fiscalYear, `${fiscalYear - 1}-04-01`, `${fiscalYear}-03-31`, scope, options),
    taxonomy: options.taxonomy ?? 'schedule-iii-synthetic',
    normalizationVersion: 'test/1.0.0',
    currency: 'INR',
    sourceScale: 'UNIT',
    scaleApplied: { from: 'UNIT', to: 'UNIT', factor: 1 },
    basis: options.basis ?? 'AS_FILED',
    filingRef: options.filingRef ?? `SYNTHETIC-FY${fiscalYear}`,
    filedAt: options.filedAt ?? `${fiscalYear}-05-30`,
    restatementOf: options.restatementOf ?? null,
    values: items,
    derived: options.derived ?? {},
  };
}

/** One synthetic quarterly period. */
export function quarterPeriod(
  issuerId: string,
  fiscalYear: number,
  quarterIndex: number,
  periodStart: string,
  periodEnd: string,
  items: Partial<Record<LineItemId, NumericObservation>>,
  options: PeriodOptions = {},
): NormalizedPeriod {
  const scope = options.scope ?? 'CONSOLIDATED';
  return {
    issuerId,
    period: identityOf('QUARTER', fiscalYear, periodStart, periodEnd, scope, { ...options, quarterIndex }),
    taxonomy: options.taxonomy ?? 'schedule-iii-synthetic',
    normalizationVersion: 'test/1.0.0',
    currency: 'INR',
    sourceScale: 'UNIT',
    scaleApplied: { from: 'UNIT', to: 'UNIT', factor: 1 },
    basis: options.basis ?? 'AS_FILED',
    filingRef: options.filingRef ?? `SYNTHETIC-FY${fiscalYear}-Q${quarterIndex}`,
    filedAt: options.filedAt ?? `${fiscalYear}-05-30`,
    restatementOf: options.restatementOf ?? null,
    values: items,
    derived: options.derived ?? {},
  };
}

/** Three consecutive complete annual periods: FY2024–FY2026. */
export function threeCompleteAnnuals(issuerId: string, options: PeriodOptions = {}): NormalizedPeriod[] {
  return [
    annualPeriod(issuerId, 2024, completeItems(), options),
    annualPeriod(issuerId, 2025, completeItems(), options),
    annualPeriod(issuerId, 2026, completeItems(), options),
  ];
}

/* ------------------------------------------------------------------- rights */

export function syntheticRightsRecord(asOf: string): DatasetRightsRecord {
  return buildRightsRecord(
    {
      manifestRights: { state: 'SYNTHETIC', basis: '', note: 'synthetic W05 lifecycle fixture' },
      evidence: {
        sourceIdentity: 'W05 synthetic fixture generator',
        sourceType: 'SYNTHETIC_GENERATED',
        documentReference: null,
        acquisitionMethod: 'SYNTHETIC_GENERATION',
        acquisitionDate: asOf,
        evidenceRefs: ['fixture:w05-lifecycle'],
      },
      permissions: {
        ACQUISITION: 'PERMITTED',
        LOCAL_STORAGE: 'PERMITTED',
        PROCESSING: 'PERMITTED',
        ANALYSIS: 'PERMITTED',
        DISPLAY: 'PERMITTED',
        RETENTION: 'PERMITTED',
        REDISTRIBUTION: 'NOT_PERMITTED',
      },
      restrictions: { conditions: ['synthetic reference mechanics only'], expiry: null, reviewBy: null },
    },
    asOf,
  );
}

export function operatorAssertedRightsRecord(
  asOf: string,
  permissions: Partial<Record<'ACQUISITION' | 'LOCAL_STORAGE' | 'PROCESSING' | 'ANALYSIS' | 'DISPLAY' | 'RETENTION' | 'REDISTRIBUTION', PermissionState>> = {},
  restrictions: { conditions?: string[]; expiry?: string | null; reviewBy?: string | null } = {},
): DatasetRightsRecord {
  return buildRightsRecord(
    {
      manifestRights: {
        state: 'OPERATOR_ASSERTED',
        basis: 'operator holds the material under recorded terms (synthetic fixture)',
        note: 'personal use; no redistribution',
      },
      evidence: {
        sourceIdentity: 'synthetic operator source',
        sourceType: 'OPERATOR_SUPPLIED_FILE',
        documentReference: 'SYNTHETIC-FILING-REF',
        acquisitionMethod: 'OPERATOR_SUPPLIED_FILE',
        acquisitionDate: asOf,
        evidenceRefs: ['sha256:synthetic-evidence-digest'],
      },
      permissions: {
        ACQUISITION: permissions.ACQUISITION ?? 'PERMITTED',
        LOCAL_STORAGE: permissions.LOCAL_STORAGE ?? 'PERMITTED',
        PROCESSING: permissions.PROCESSING ?? 'PERMITTED',
        ANALYSIS: permissions.ANALYSIS ?? 'PERMITTED',
        DISPLAY: permissions.DISPLAY ?? 'PERMITTED',
        RETENTION: permissions.RETENTION ?? 'PERMITTED',
        REDISTRIBUTION: permissions.REDISTRIBUTION ?? 'NOT_PERMITTED',
      },
      restrictions: {
        conditions: restrictions.conditions ?? [],
        expiry: restrictions.expiry ?? null,
        reviewBy: restrictions.reviewBy ?? null,
      },
    },
    asOf,
  );
}

/* ------------------------------------------------------------------ catalog */

export interface CatalogEntryOptions {
  readonly datasetVersion?: string;
  readonly sourceLabel?: string;
  readonly sourceRights?: DatasetSourceRecord['sourceRights'];
  readonly rights?: DatasetRightsRecord;
  readonly integrity?: { readonly ok: boolean; readonly detail: string | null };
  readonly issues?: readonly IngestionIssue[];
  readonly importRunId?: string;
  readonly lastImportAt?: string;
}

export function catalogEntry(
  issuers: readonly { issuerId: string; periods: readonly NormalizedPeriod[] }[],
  options: CatalogEntryOptions = {},
): DatasetCatalogEntry {
  return {
    dataset: {
      datasetVersion: options.datasetVersion ?? 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      datasetSchema: SCHEMA_V1,
      provider: 'w05-synthetic-fixture',
      licence: 'synthetic; not redistributable',
      ...(options.sourceRights === undefined
        ? { sourceRights: { state: 'SYNTHETIC' as const, basis: '', note: 'synthetic W05 lifecycle fixture' } }
        : { sourceRights: options.sourceRights }),
      importRunId: options.importRunId ?? 'run-w05-synthetic',
      lastImportAt: options.lastImportAt ?? '2026-09-10T00:00:00.000Z',
      dataAsOf: '2026-09-10',
      knownAsOf: '2026-09-10',
    },
    sourceLabel: options.sourceLabel ?? 'w05-synthetic-fixture',
    integrity: options.integrity ?? { ok: true, detail: null },
    ...(options.rights === undefined ? {} : { rights: options.rights }),
    issuers,
    ...(options.issues === undefined ? {} : { issues: options.issues }),
  };
}

/** A catalog entry whose content is complete and fresh for the given issuers, with synthetic rights. */
export function suitableEntry(
  issuerIds: readonly string[],
  options: CatalogEntryOptions & { readonly periodsFor?: (issuerId: string) => readonly NormalizedPeriod[] } = {},
): DatasetCatalogEntry {
  return catalogEntry(
    issuerIds.map((issuerId) => ({
      issuerId,
      periods: options.periodsFor?.(issuerId) ?? threeCompleteAnnuals(issuerId),
    })),
    {
      rights: syntheticRightsRecord('2026-09-15'),
      ...options,
    },
  );
}

/** `nilByDisclosure` needs the filer's own words; fixtures quote a synthetic sentence. */
export function syntheticNil(periodEnd: string): NumericObservation {
  return nilByDisclosure(SOURCE, {
    periodEnd,
    statement: 'The Company has nil balances under this head (synthetic fixture sentence).',
  });
}

export function syntheticMissing(reason: 'NOT_REPORTED' | 'NOT_TAGGED_IN_FILING'): NumericObservation {
  return missing(reason);
}
