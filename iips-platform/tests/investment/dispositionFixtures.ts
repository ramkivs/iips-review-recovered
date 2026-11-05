/**
 * IID-4 — shared fixtures for the disposition tests.
 *
 * Built from REAL IID-2 engine output (`assessCompany` over the committed synthetic datasets), then
 * mutated field-by-field for each matrix case. Deliberately not hand-written payload literals: a hand-built
 * payload drifts from the engine's actual shape the first time IID-2 changes, and the test would keep
 * passing on a shape nothing produces.
 */
import { assessCompany } from '../../src/investment/assessment/engine';
import type { CompanyAssessmentPayload } from '../../src/investment/assessment/types';
import { bankAssessmentInput, techAssessmentInput, thinAssessmentInput } from './assessmentFixtures';
import { resolveLimits, type LimitsPolicyDocument } from '../../src/investment/disposition/limits';
import { candidateSubject, heldSubject } from '../../src/investment/disposition/subject';
import type {
  CandidateSubjectFacts,
  HeldSubjectFacts,
  LimitsBasis,
  PortfolioContextBlock,
  ResolvedLimits,
} from '../../src/investment/disposition/types';
import { notApplicable, present } from '../../src/investment/contracts/observation';
import type { PortfolioFacts } from '../../src/investment/disposition/gates';

/**
 * Re-key a payload's ISSUER identity, leaving every security identity alone.
 *
 * The IID-2 fixtures key the issuer as `IN:ISIN:<isin>` (the fixture issuer IS the security). A disposition
 * subject must carry a real ISSUER identity (`IN:CIN:` or `IN:EQISIN:`), so the fixture payloads are
 * re-keyed exactly the way IID-3's M-1 demonstration re-keys them — the same company, addressed correctly.
 */
export function rekeyIssuer(payload: CompanyAssessmentPayload, issuerId: string): CompanyAssessmentPayload {
  return {
    ...payload,
    subject: { ...payload.subject, issuerId },
  } as CompanyAssessmentPayload;
}

export const TECH_SUBJECT_ISSUER = 'IN:EQISIN:IN0000000201';
export const BANK_SUBJECT_ISSUER = 'IN:CIN:L65110KA1981PLC013116';
export const THIN_SUBJECT_ISSUER = 'IN:CIN:L72200KA1981PLC013117';

/** A real, zero-violation Technology payload: SUFFICIENT, CLEAN, WIDE, COVERED, no risk factors. */
export function techPayload(): CompanyAssessmentPayload {
  const result = assessCompany(techAssessmentInput());
  if (result.violations.length > 0) {
    throw new Error(`fixture payload violates its own invariants: ${JSON.stringify(result.violations.slice(0, 3))}`);
  }
  return rekeyIssuer(result.payload, TECH_SUBJECT_ISSUER);
}

/** A real Banking payload: PARTIAL, moat INSUFFICIENT_EVIDENCE, dividend INSUFFICIENT_EVIDENCE. */
export function bankPayload(): CompanyAssessmentPayload {
  return rekeyIssuer(assessCompany(bankAssessmentInput()).payload, BANK_SUBJECT_ISSUER);
}

/** A real thin payload: INSUFFICIENT adequacy, no valuation. */
export function thinPayload(): CompanyAssessmentPayload {
  return rekeyIssuer(assessCompany(thinAssessmentInput()).payload, THIN_SUBJECT_ISSUER);
}

type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { readonly [K in keyof T]?: DeepPartial<T[K]> }
    : T;

function merge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(patch)) return patch as unknown as T;
  if (typeof patch !== 'object') return patch as unknown as T;
  if (base === null || typeof base !== 'object' || Array.isArray(base)) return patch as unknown as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    out[key] = merge((base as Record<string, unknown>)[key], value);
  }
  return out as T;
}

/** Deep-patch a payload without mutating the original. */
export function patchPayload(
  base: CompanyAssessmentPayload,
  patch: DeepPartial<CompanyAssessmentPayload>,
): CompanyAssessmentPayload {
  return merge(structuredClone(base), patch);
}

/** Set `mosVsMid` (a FRACTION in the payload) from percentage points, and keep the band consistent. */
export function withMos(payload: CompanyAssessmentPayload, points: number | null): CompanyAssessmentPayload {
  const band =
    points === null
      ? null
      : points >= 40
        ? 'DEEP_DISCOUNT'
        : points >= 15
          ? 'DISCOUNT'
          : points >= -15
            ? 'FAIR'
            : points >= -40
              ? 'PREMIUM'
              : 'SIGNIFICANT_PREMIUM';
  const mos = payload.valuation.marginOfSafety;
  if (mos === null) return payload;
  return merge(structuredClone(payload), {
    valuation: {
      marginOfSafety: {
        mosVsMid:
          points === null ? { value: null, presence: 'NOT_COMPUTABLE', reason: 'PRICE_UNAVAILABLE' } : { ...mos.mosVsMid, value: points / 100, presence: 'PRESENT' },
        band,
      },
    },
  });
}

/**
 * Make the payload's net debt / EBITDA ratio rise over time (newest-first array), so the REDUCE trigger
 * "dividend UNCOVERED with rising leverage" can be exercised on a payload that really has that shape
 * instead of one where the assertion would depend on a fixture coincidence.
 */
export function withRisingLeverage(payload: CompanyAssessmentPayload): CompanyAssessmentPayload {
  const clone = structuredClone(payload) as CompanyAssessmentPayload;
  const targets = [1.2, 1.0, 0.8, 0.6, 0.4];
  const annual = clone.fundamentals.annual.map((period, index) => {
    const ebitda = period.derived.EBITDA?.value ?? 1_000_000_000;
    const ratio = targets[index] ?? 0.4;
    return {
      ...period,
      derived: {
        ...period.derived,
        NET_DEBT: { ...(period.derived.NET_DEBT ?? {}), value: Math.round(ratio * ebitda), presence: 'PRESENT' },
      },
    };
  });
  return { ...clone, fundamentals: { ...clone.fundamentals, annual } } as CompanyAssessmentPayload;
}

export const TECH_ISSUER_ID = TECH_SUBJECT_ISSUER;
export const TECH_SECURITY_ID = 'IN:ISIN:IN0000000201';
export const BANK_ISSUER_ID = BANK_SUBJECT_ISSUER;
export const SECOND_SECURITY_ID = 'IN:ISIN:IN0000000219';

export const NOW = '2026-11-06T06:00:00.000Z';
export const PORTFOLIO_ID = 'pf-iid4-demo';

export function heldFixture(overrides: Partial<Parameters<typeof heldSubject>[0]> = {}): HeldSubjectFacts {
  return heldSubject({
    portfolioId: PORTFOLIO_ID,
    securityId: TECH_SECURITY_ID,
    issuerId: TECH_ISSUER_ID,
    symbol: 'AARAVSYN',
    exchange: 'NSE',
    securityClass: 'EQUITY',
    heldAsOf: NOW,
    identityState: 'RESOLVED',
    securityState: 'ACTIVE',
    quantities: {
      quantity: present(1000, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
      averageCost: present(2400, { kind: 'OPERATOR_ENTRY', ref: 'portfolio-snapshot', locator: 'row:1' }),
      marketValue: present(2_640_000, { kind: 'DATASET', ref: 'portfolio-snapshot:market-values' }),
      unrealisedGainPct: present(10, { kind: 'DERIVED', ref: 'snapshot/unrealised' }),
    },
    ...overrides,
  });
}

export function candidateFixture(overrides: Partial<Parameters<typeof candidateSubject>[0]> = {}): CandidateSubjectFacts {
  return candidateSubject({
    issuerId: TECH_ISSUER_ID,
    securityId: TECH_SECURITY_ID,
    contextPortfolioId: PORTFOLIO_ID,
    origin: 'WATCHLIST',
    symbol: 'AARAVSYN',
    exchange: 'NSE',
    securityClass: 'EQUITY',
    identityState: 'RESOLVED',
    securityState: 'ACTIVE',
    ...overrides,
  });
}

export const DEFAULT_LIMITS: ResolvedLimits = resolveLimits({ policy: null, asOf: NOW });

export function operatorLimits(overrides: Partial<LimitsPolicyDocument> = {}): ResolvedLimits {
  const document: LimitsPolicyDocument = {
    policyVersion: 'limits-policy/2026-11',
    effectiveFrom: '2026-10-01',
    singleNameMaxPct: 8,
    sectorMaxPct: { DEFAULT: 25, Technology: 20 },
    notes: 'operator-configured test policy',
    ...overrides,
  };
  return resolveLimits({ policy: document, asOf: NOW });
}

export function portfolioFacts(overrides: Partial<PortfolioFacts> = {}): PortfolioFacts {
  return {
    present: true,
    weightPct: 4,
    companyExposurePct: 4,
    sectorExposurePct: 12,
    topHoldingWeightPct: 9,
    ...overrides,
  };
}

export function portfolioBlock(overrides: Partial<PortfolioContextBlock> = {}): PortfolioContextBlock {
  return {
    portfolioRevision: 7,
    asOf: NOW,
    holdingsMeasured: 4,
    holdingsUnresolved: 1,
    holdingsOutOfScope: 1,
    measuredWeightPct: 78,
    unmeasuredWeightPct: present(22, { kind: 'DERIVED', ref: 'portfolio-snapshot:unmeasured' }),
    weightPct: present(4, { kind: 'DATASET', ref: 'portfolio-snapshot:market-values' }),
    companyExposurePct: present(4, { kind: 'DATASET', ref: 'portfolio-snapshot:market-values' }),
    sectorExposurePct: present(12, { kind: 'DATASET', ref: 'portfolio-snapshot:market-values' }),
    sectorMeasuredWeightPct: present(78, { kind: 'DERIVED', ref: 'portfolio-snapshot:sector-coverage' }),
    notes: ['fixture: sector references are known for every measured holding'],
    topHoldingWeightPct: present(9, { kind: 'DATASET', ref: 'portfolio-snapshot:market-values' }),
    concentrationBand: present('Moderate', { kind: 'DERIVED', ref: 'csip:diversification' }),
    countBasedSectorExposure: { Technology: 50, Banking: 25, Consumer: 25 },
    countBasedConcentrationPct: 50,
    diversificationBand: 'Moderate',
    correlationFlags: [],
    sectorReferenceContext: {
      evidenceClass: 'SECTOR_REFERENCE',
      sector: 'Technology',
      normalizedHolding: { conviction: 71, quality: 68, risk: 34 },
      note: 'count-based CSIP context; labelled and not verb-driving',
    },
    ...overrides,
  };
}

export function candidateLimitsBasis(limits: ResolvedLimits): LimitsBasis {
  return limits.basis;
}

export const NOT_APPLICABLE_QUANTITY = notApplicable<number>('POLICY_INPUTS_UNAVAILABLE');

/** A deep risk factor at a chosen severity/status, shaped exactly like the IID-2 payload's. */
export function riskFactor(severity: 1 | 2 | 3 | 4 | 5, status: 'NEW' | 'ONGOING' | 'RESOLVED' | 'UNVERIFIED') {
  return {
    riskId: `risk-sev${severity}-${status.toLowerCase()}`,
    category: 'FINANCIAL' as const,
    severity,
    likelihood: severity,
    status,
    statement: `Synthetic fixture risk at severity ${severity} (${status})`,
    // The IID-2 risk factor's evidence list holds resolved references; an empty list is valid and is what
    // the Banking fixture itself carries, so no path is invented here for the validator to trip over.
    evidence: [],
  };
}
