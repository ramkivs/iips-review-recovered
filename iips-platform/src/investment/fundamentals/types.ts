/**
 * IID-0 — fundamental dataset content model.
 *
 * Everything here is a *dataset* fact. None of it is an assessment, and none of it is an opinion.
 */
import type { Exchange, InstrumentType, IssuerKeyBasis, ListingSeries } from '../contracts/ids';
import type { NumericObservation } from '../contracts/observation';
import type { LineItemId } from '../contracts/lineItems';
import type { PeriodIdentity, ReportingCurrency, Scale, ScaleApplied } from '../contracts/period';
import type { OperatingMetricRecord, SectorName } from '../contracts/operatingMetrics';

export type InstrumentStatus = 'ASSESSABLE' | 'OUT_OF_SCOPE' | 'INELIGIBLE';

export interface IssuerRecord {
  readonly issuerId: string;
  readonly legalName: string;
  readonly issuerKeyBasis: IssuerKeyBasis;
  readonly sector: SectorName;
  readonly subSegment: string | null;
  readonly reportingCurrency: ReportingCurrency;
  readonly fiscalYearEnd: string;
}

export interface SecurityRecord {
  readonly securityId: string;
  readonly issuerId: string;
  readonly instrumentType: InstrumentType;
  readonly status: InstrumentStatus;
  readonly statusReason: string | null;
}

export interface ListingRecord {
  readonly listingId: string;
  readonly securityId: string;
  readonly issuerId: string;
  readonly exchange: Exchange;
  readonly symbol: string;
  readonly series: ListingSeries;
  readonly instrumentType: InstrumentType;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

export interface NormalizedPeriod {
  readonly issuerId: string;
  readonly period: PeriodIdentity;
  readonly taxonomy: string;
  readonly normalizationVersion: string;
  readonly currency: ReportingCurrency;
  readonly sourceScale: Scale;
  readonly scaleApplied: ScaleApplied;
  readonly basis: 'AS_FILED' | 'RESTATED';
  readonly filingRef: string;
  readonly filedAt: string;
  readonly restatementOf: string | null;
  /** As filed. */
  readonly values: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
  /** Produced from `values` by the closed derivation set; never filed, never a substitute for a filing. */
  readonly derived: Readonly<Partial<Record<LineItemId, NumericObservation>>>;
}

export interface PriceRecord {
  readonly securityId: string;
  readonly value: number;
  readonly currency: ReportingCurrency;
  readonly asOf: string;
  readonly kind: 'CLOSE' | 'VWAP' | 'LAST';
  readonly source: 'PIT_D01' | 'DATASET_EOD';
  readonly sourceRef: string;
  readonly adjustment: { readonly factor: number; readonly corporateActionId: string } | null;
}

export type CorporateActionType =
  | 'SPLIT'
  | 'BONUS'
  | 'CONSOLIDATION'
  | 'RIGHTS'
  | 'BUYBACK_TENDER'
  | 'BUYBACK_OPEN_MARKET'
  | 'MERGER'
  | 'DEMERGER'
  | 'SYMBOL_CHANGE'
  | 'NAME_CHANGE'
  | 'DELISTING'
  | 'PREFERENCE_REDEMPTION'
  | 'CAPITAL_REDUCTION';

export interface CorporateActionRecord {
  readonly actionId: string;
  readonly type: CorporateActionType;
  readonly effectiveDate: string;
  readonly subjectIssuerId: string;
  readonly subjectSecurityId: string | null;
  /** False ⇒ per-share series are NOT comparable across this boundary unless a factor is applied. */
  readonly perShareComparable: boolean;
  readonly adjustmentFactor: number | null;
  readonly factorBasis: string | null;
  readonly successors: readonly { readonly issuerId: string; readonly ratio: number }[];
  readonly sourceRef: string;
}

export interface IngestionIssue {
  readonly severity: 'ERROR' | 'WARNING';
  readonly code: string;
  readonly subject: string;
  readonly detail: string;
}

/** The dataset content. `manifest` is computed from this and is not part of it. */
export interface DatasetContent {
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly SecurityRecord[];
  readonly listings: readonly ListingRecord[];
  readonly periods: readonly NormalizedPeriod[];
  readonly prices: readonly PriceRecord[];
  readonly corporateActions: readonly CorporateActionRecord[];
  readonly operatingMetrics: readonly OperatingMetricRecord[];
  readonly issues: readonly IngestionIssue[];
}
