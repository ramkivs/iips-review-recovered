/**
 * IID-3 — read-only client for the investment assessment surface.
 *
 * READ-ONLY BY CONSTRUCTION. This module issues GET requests only. There is no create, no version, no
 * disposition, no order, no trade and no "change intelligence" call anywhere in it, because the server
 * exposes none: artifacts are produced by the operator CLI, not by a browser.
 *
 * FAILURE VOCABULARY IS CLOSED. The server sends fixed, sanitized bodies. They are mapped onto six local
 * reasons and rendered as fixed copy; no server prose is ever shown, so a path, an owner pair or a stack
 * trace cannot reach the DOM even if the server were misconfigured to send one.
 */
export const INVESTMENT_ASSESSMENT_ROUTES = Object.freeze({
  company: (issuerId: string): string => `/api/investment/company/${encodeURIComponent(issuerId)}`,
  version: (issuerId: string, reportId: string): string =>
    `/api/investment/company/${encodeURIComponent(issuerId)}/versions/${encodeURIComponent(reportId)}`,
});

/* ------------------------------------------------------------------ value shapes */

export type Presence = 'PRESENT' | 'MISSING' | 'NOT_APPLICABLE' | 'NOT_COMPUTABLE' | 'IMPUTED';

/** A number that is never "absent by being zero". */
export interface NumericObservationView {
  readonly value: number | null;
  readonly presence: Presence;
  readonly reason?: string;
  readonly periodEnd?: string;
  readonly basis?: string;
  readonly note?: string;
  readonly source?: { readonly kind: string; readonly ref: string; readonly filedAt?: string };
}

export interface AssessmentVersionView {
  readonly reportId: string;
  readonly artifactVersion: number;
  readonly supersedesReportId: string | null;
  readonly generatedAt: string;
  readonly reportKey: string;
  readonly payloadDigest: string;
  readonly inputDigest: string;
  readonly dataAsOf: string;
  readonly knownAsOf: string;
  readonly datasetVersion: string;
  readonly contentDigest: string;
  readonly modelVersion: string;
  readonly policyVersion: string;
  readonly adequacy: string;
  readonly qualityVerdict: string;
  readonly confidence: number | null;
  readonly evidenceCount: number;
  readonly limitationCount: number;
  readonly datasetClass: string;
}

/** The subset of the assessment payload this surface renders. The payload itself is broader. */
export interface CompanyAssessmentView {
  readonly schemaVersion: number;
  readonly artifact: {
    readonly kind: string;
    readonly subjectScope: string;
    readonly modelVersion: string;
    readonly policyVersion: string;
    readonly generatedAt: string;
  };
  readonly subject: {
    readonly issuerId: string;
    readonly legalName: string;
    readonly sector: string;
    readonly sectorSubsegment: string | null;
    readonly reportingCurrency: string;
    readonly fiscalYearEnd: string;
    readonly identity: {
      readonly bindingRef: string;
      readonly rosterVersion: string;
      readonly listingMapVersion: string;
      readonly corporateActionTableVersion: string;
    };
  };
  readonly asOf: {
    readonly generatedAt: string;
    readonly dataAsOf: string;
    readonly knownAsOf: string;
    readonly stalenessDays: number;
    readonly staleBeyondPolicy: boolean;
  };
  readonly data: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly series: { readonly statementScope: string; readonly annualPeriods: number };
  };
  readonly completeness: {
    readonly requiredFieldCoveragePct: number;
    readonly adequacy: string;
    readonly adequacyBasis: readonly string[];
    readonly missingFields: readonly {
      readonly field: string;
      readonly reason: string;
      readonly periodEnd: string;
    }[];
  };
  readonly quality: {
    readonly verdict: string;
    readonly flags: readonly { readonly code: string; readonly detail: string }[];
  };
  readonly valuation: {
    readonly methodSelection: {
      readonly sector: string;
      readonly considered: readonly { readonly methodId: string; readonly role: string; readonly reason: string }[];
    };
    readonly methods: readonly {
      readonly methodId: string;
      readonly role: string;
      readonly applicable: boolean;
      readonly notApplicableReason: string | null;
      readonly output: { readonly perShare: number | null } | null;
    }[];
    readonly intrinsic: {
      readonly currency: string;
      readonly perShare: {
        readonly low: NumericObservationView;
        readonly mid: NumericObservationView;
        readonly high: NumericObservationView;
      };
      readonly spreadPct: NumericObservationView;
      readonly withheld: { readonly unmetInputs: readonly string[] } | null;
    } | null;
    readonly marginOfSafety: {
      readonly price: NumericObservationView;
      readonly priceAsOf: string | null;
      readonly mosVsMid: NumericObservationView;
      readonly mosVsLow: NumericObservationView;
      readonly band: string | null;
      readonly refusal: string | null;
    } | null;
    readonly sensitivity: readonly {
      readonly methodId: string;
      readonly baseWaccBps: number;
      readonly baseGrowthBps: number;
      readonly points: readonly {
        readonly waccBps: number;
        readonly growthBps: number;
        readonly value: NumericObservationView;
      }[];
    }[];
  };
  readonly risk: {
    readonly factors: readonly {
      readonly riskId: string;
      readonly category: string;
      readonly severity: number;
      readonly likelihood: number;
      readonly status: string;
      readonly statement: string;
    }[];
    readonly aggregate: NumericObservationView | null;
  };
  readonly dividends: {
    readonly verdict: string;
    readonly payoutRatio: NumericObservationView;
    readonly fcfCoverage: NumericObservationView;
    readonly netDebtToEbitda: NumericObservationView;
    readonly consecutiveYearsPaid: number;
    readonly conflict: string | null;
    readonly withheld: { readonly unmetInputs: readonly string[] } | null;
  };
  readonly moat: {
    readonly classification: string;
    readonly roicWaccSpread: {
      readonly spread: NumericObservationView;
      readonly consecutiveYearsPositive: number;
    };
    readonly withheld: { readonly unmetInputs: readonly string[] } | null;
  };
  readonly confidence: { readonly dataConfidence: number; readonly modelConfidence: number; readonly combined: number };
  readonly assumptions: {
    readonly discountRate: { readonly value: number; readonly basis: string } | null;
    readonly terminalGrowth: number | null;
    readonly forecastHorizonYears: number | null;
    readonly policyVersion: string;
  };
  readonly sectorReferenceView: {
    readonly evidenceClass: string;
    readonly sectorRefId: string;
    readonly engineVerdict: string | null;
    readonly composite: number | null;
    readonly note: string;
  };
  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly claim: string;
    readonly supports: readonly string[];
    readonly source: { readonly kind: string; readonly ref: string; readonly filedAt?: string };
    readonly observationRefs: readonly string[];
  }[];
  readonly limitations: readonly string[];
  readonly disclosure: {
    readonly decisionSupportOnly: boolean;
    readonly noTradeExecution: boolean;
    readonly nonProduction: boolean;
  };
}

export interface AssessmentEnvelope {
  readonly status: 'OK';
  readonly reportType: string;
  readonly scope: {
    readonly scopeToken: string;
    readonly reportKey: string;
    readonly chainRootReportId: string;
    readonly versionCount: number;
  };
  readonly version: AssessmentVersionView;
  readonly versions: readonly AssessmentVersionView[];
  readonly assessment: CompanyAssessmentView;
  readonly disclosures: {
    readonly decisionSupportOnly: boolean;
    readonly noTradeExecution: boolean;
    readonly nonProduction: boolean;
    readonly datasetNotice: string;
  };
  readonly limitations: readonly string[];
}

/* --------------------------------------------------------------------- failures */

export type AssessmentUnavailableReason =
  | 'scope-invalid'
  | 'not-found'
  | 'owner-context-unavailable'
  | 'persistence-unavailable'
  | 'integrity-failure'
  | 'unrecognised';

export class AssessmentUnavailableError extends Error {
  constructor(readonly reason: AssessmentUnavailableReason, readonly status: number) {
    super(ASSESSMENT_UNAVAILABLE_COPY[reason]);
    this.name = 'AssessmentUnavailableError';
  }
}

/** Fixed copy per reason. Nothing here interpolates a server string. */
export const ASSESSMENT_UNAVAILABLE_COPY: Readonly<Record<AssessmentUnavailableReason, string>> = Object.freeze({
  'scope-invalid': 'That issuer identifier is not an admissible investment scope, so nothing was read.',
  'not-found': 'No stored assessment exists for this issuer. Assessments are produced by the operator CLI.',
  'owner-context-unavailable': 'Ownership is not established on this server, so no assessment can be read.',
  'persistence-unavailable': 'The governed persistence boundary is unavailable. Nothing was read or written.',
  'integrity-failure':
    'Stored investment artifacts failed validation and were withheld. A partially validated history is never shown.',
  unrecognised: 'The assessment could not be read because the response was not recognised.',
});

function reasonOf(status: number, payload: unknown): AssessmentUnavailableReason {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  const code = typeof record.error === 'string' ? record.error : '';
  if (code === 'owner-context-unavailable') return 'owner-context-unavailable';
  if (code === 'investment-persistence-unavailable') return 'persistence-unavailable';
  if (code === 'investment-artifact-integrity-failure') return 'integrity-failure';
  if (code === 'investment-scope-invalid') return 'scope-invalid';
  if (code === 'investment-artifact-not-found') return 'not-found';
  if (status === 400) return 'scope-invalid';
  if (status === 404) return 'not-found';
  if (status === 503) return 'persistence-unavailable';
  return 'unrecognised';
}

/**
 * A response is only usable when it carries every section the view renders.
 *
 * An envelope missing a section is an error rather than a page with a hole: a sparse assessment view would
 * be indistinguishable from an assessment that genuinely has no evidence, and that distinction matters.
 */
function assertEnvelope(payload: unknown): AssessmentEnvelope {
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
  const assessment = record?.assessment as Record<string, unknown> | undefined;
  const shapeOk =
    record !== null &&
    record.status === 'OK' &&
    typeof record.scope === 'object' &&
    record.scope !== null &&
    typeof record.version === 'object' &&
    record.version !== null &&
    Array.isArray(record.versions) &&
    Array.isArray(record.limitations) &&
    typeof assessment === 'object' &&
    assessment !== null &&
    typeof assessment.subject === 'object' &&
    typeof assessment.completeness === 'object' &&
    typeof assessment.quality === 'object' &&
    typeof assessment.valuation === 'object' &&
    typeof assessment.risk === 'object' &&
    typeof assessment.dividends === 'object' &&
    typeof assessment.moat === 'object' &&
    Array.isArray(assessment.evidence) &&
    typeof assessment.disclosure === 'object';
  if (!shapeOk) throw new AssessmentUnavailableError('unrecognised', 200);
  return payload as AssessmentEnvelope;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim() === '') return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** Read one issuer's assessment chain head, or one version of it. GET only. */
export async function fetchCompanyAssessment(
  issuerId: string,
  reportId?: string,
): Promise<AssessmentEnvelope> {
  const url =
    reportId === undefined
      ? INVESTMENT_ASSESSMENT_ROUTES.company(issuerId)
      : INVESTMENT_ASSESSMENT_ROUTES.version(issuerId, reportId);
  const response = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  const payload = await readPayload(response);
  if (!response.ok) throw new AssessmentUnavailableError(reasonOf(response.status, payload), response.status);
  return assertEnvelope(payload);
}

/* ---------------------------------------------------------------- limitation copy */

/**
 * Limitation disclosures rendered beside every assessment.
 *
 * These mirror the single authoritative register
 * (`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`) and are deliberately
 * short: the register is the record, this is the notice. `investment.test.ts` asserts this list matches the
 * identifier list the server sends, so a new limitation cannot be added to one side only.
 */
export const LIMITATION_DISCLOSURES: readonly { readonly id: string; readonly text: string }[] = Object.freeze([
  { id: 'L-001', text: '3 of 13 sectors are measured; 10 remain outstanding in the frozen sector engines.' },
  { id: 'L-002', text: '20 XBRL tags are mapped; tags outside that set are visible gaps, not silent zeros.' },
  { id: 'L-003', text: 'The derivation set is closed at 8 items; anything else is reported as not computable.' },
  { id: 'L-004', text: 'The reference dataset is synthetic: it validates mechanics, never a company.' },
  { id: 'L-005', text: 'Bank dividends are withheld (NET_DEBT_TO_EBITDA_UNAVAILABLE) pending a bank-specific policy.' },
  { id: 'L-006', text: 'Restricted cash is NOT_COMPUTABLE: the schema has no such line item.' },
  { id: 'L-007', text: 'The dilution proxy is capped at 0.98; it is not observed dilution.' },
  { id: 'L-008', text: 'SOTP is not implemented (METHOD_NOT_IMPLEMENTED_IN_ENGINE_V1); no segment values are manufactured.' },
  { id: 'L-009', text: 'No real issuer has been assessed through this pipeline; demonstrations use synthetic data.' },
  { id: 'L-010', text: 'Chains are located by bounded scan: the persistence boundary exposes no find-by-chain operation.' },
  { id: 'L-011', text: 'Two scope namespaces exist: the chain scope (co:/hd:/hc:/icr:) and the payload subject scope.' },
  { id: 'L-012', text: 'The chain root report id stands in for the store-internal chain identifier.' },
  { id: 'L-013', text: 'Idempotency is decided against the chain head only, not against every historical version.' },
]);
