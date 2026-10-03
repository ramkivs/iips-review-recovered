/**
 * NP-12 N4-A13 Increment 2 — Governed 13-Engine Screen Producer Adapter.
 *
 * Authority:
 *   - NP-12-N4-A6-CONTRACT-SPECIFICATION.md (frozen `NP12MBR` / `NP12EXE` / `NP12RES` v01)
 *   - NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md (Increment 1 Screen runtime boundary)
 *   - NP-12-N4-A12-AUTHORITY-DECISION-RECORD.md (`GDS-01`..`GDS-12`, `A12-D01`..`A12-D03`)
 *
 * Implements the bounded Increment 2 producer convergence adapter without modifying any of
 * the 13 certified sector engines, `renorm()`, N4-SD (`ScreenDefinition.ts`), the CSIP
 * cross-sector comparison modules, the N4-A10 Screen runtime modules, `EngineRegistry.ts`,
 * `EngineApiAdapter.ts`, or `frontend/server/executive-transport.ts`.
 *
 * Claim boundary (N4-A12 §12.2): Existing E2E-030 engine certification is preserved untouched
 * and does NOT transitively certify this Screen producer adapter. This module provides
 * governed producer-to-Screen (`NP12MBR` / `NP12EXE` / `NP12RES` v01) convergence for the
 * COMPLETED execution branch only (`A8-S-03` FAILED branch remains open and excluded).
 */

import { Container } from '../../../di/Container';
import { EvidencePipeline } from '../../../framework/evidence/EvidencePipeline';
import { FixedClock } from '../../../infrastructure/Clock';
import { DeterministicIdProvider } from '../../../infrastructure/IdProvider';
import {
  CERTIFIED_ENGINES,
  getEngineEntry,
  getEngineForSector,
  type EngineRegistryEntry,
} from '../../../integration/EngineRegistry';
import type {
  ExecutionRequest,
  ExecutionResult,
  SectorPlugin,
} from '../../../plugin-loader/PluginContract';
import { PluginLoader } from '../../../plugin-loader/PluginLoader';
import { ReplayService } from '../../../replay/ReplayService';
import { RuntimeCoordinator } from '../../../runtime/RuntimeCoordinator';
import { SnapshotService, type Snapshot } from '../../../snapshot/SnapshotService';
import { SnapshotStore } from '../../../snapshot/SnapshotStore';
import { AutoEngine, AUTO_ENGINE_ID } from '../../auto/AutoEngine';
import { BankingEngine, BANKING_ENGINE_ID } from '../../banking/BankingEngine';
import {
  CapitalMarketsEngine,
  CAPITAL_MARKETS_ENGINE_ID,
} from '../../capital-markets/CapitalMarketsEngine';
import { ConsumerEngine, CONSUMER_ENGINE_ID } from '../../consumer/ConsumerEngine';
import type { ScreenDefinition } from '../definition/ScreenDefinition';
import {
  CANONICAL_SECTORS,
  type CanonicalSector,
  type PopulationMember,
} from '../population/ScreeningPopulation';
import { EnergyEngine, ENERGY_ENGINE_ID } from '../../energy/EnergyEngine';
import { HealthcareEngine, HEALTHCARE_ENGINE_ID } from '../../healthcare/HealthcareEngine';
import { HospitalityEngine, HOSPITALITY_ENGINE_ID } from '../../hospitality/HospitalityEngine';
import { IndustrialsEngine, INDUSTRIALS_ENGINE_ID } from '../../industrials/IndustrialsEngine';
import { InsuranceEngine, INSURANCE_ENGINE_ID } from '../../insurance/InsuranceEngine';
import { MaterialsEngine, MATERIALS_ENGINE_ID } from '../../materials/MaterialsEngine';
import { TechnologyEngine, TECHNOLOGY_ENGINE_ID } from '../../technology/TechnologyEngine';
import { TelecomEngine, TELECOM_ENGINE_ID } from '../../telecom/TelecomEngine';
import { UtilitiesEngine, UTILITIES_ENGINE_ID } from '../../utilities/UtilitiesEngine';
import {
  executeScreen,
  type ScreenExecution,
} from './ScreenExecution';
import {
  CANONICAL_SCREEN_SECTORS,
  DECIMAL_MAX_Q,
  DECIMAL_SCALE,
  admitMember,
  canonicalDecimalText,
  requireCanonicalDecimal,
  type AdmittedMember,
  type GrowthAvailability,
  type ScreenMemberInput,
} from './ScreenMemberInput';
import type { ScreenResult } from './ScreenResult';

/**
 * Fixed deterministic clock epoch used for governed sector-engine execution when producing
 * Screen member inputs (matches `EngineApiAdapter.FIXED_NOW` and `PROGRAM_v1.1_REPLAY_BASELINE.json`).
 * Audit-only `timestamp` and `requestId` never alter engine snapshot/evidence IDs (`A6-DR-02`, `A6-DR-03`).
 */
export const DEFAULT_PRODUCER_CLOCK_EPOCH = '2026-08-09T00:00:00.000Z';

/** Governed producer-side fail-closed error codes. */
export type ScreenProducerErrorCode =
  | 'PRODUCER_REQUEST_MALFORMED'
  | 'PRODUCER_SECTOR_INVALID'
  | 'PRODUCER_ENGINE_UNRESOLVED'
  | 'PRODUCER_ENGINE_EXECUTION_FAILED'
  | 'PRODUCER_SNAPSHOT_MISSING'
  | 'PRODUCER_SUPPORTING_SCORES_MISSING'
  | 'PRODUCER_CONVICTION_INVALID'
  | 'PRODUCER_QUALITY_INVALID'
  | 'PRODUCER_GROWTH_INVALID'
  | 'PRODUCER_DECIMAL_NON_FINITE'
  | 'PRODUCER_DECIMAL_OUT_OF_RANGE'
  | 'PRODUCER_IDENTITY_MISSING'
  | 'PRODUCER_IDENTITY_INVALID'
  | 'PRODUCER_IDENTITY_MISMATCH'
  | 'PRODUCER_METADATA_INVALID'
  | 'PRODUCER_PROVENANCE_MISSING'
  | 'PRODUCER_ADMISSION_FAILED';

/** Typed fail-closed error raised by the Screen producer boundary. */
export class ScreenProducerError extends Error {
  constructor(readonly code: ScreenProducerErrorCode, message: string) {
    super(message);
    this.name = 'ScreenProducerError';
  }
}

/**
 * Injectable EngineRegistry lookup contract (`GDS-08` Option A: `EngineRegistry.getEngine(result.engineId)`).
 */
export interface EngineRegistryLookup {
  getEngine(engineId: string): EngineRegistryEntry | undefined;
  getEngineForSector?(sectorFamily: string): EngineRegistryEntry | undefined;
}

/** Default governed EngineRegistry adapter backed by `src/integration/EngineRegistry.ts`. */
export const DEFAULT_ENGINE_REGISTRY: EngineRegistryLookup = Object.freeze({
  getEngine(engineId: string): EngineRegistryEntry | undefined {
    return getEngineEntry(engineId);
  },
  getEngineForSector(sectorFamily: string): EngineRegistryEntry | undefined {
    return getEngineForSector(sectorFamily);
  },
});

/**
 * GDS-02: Complete 13-engine runtime `score.pillars` key bound to Screen `quality`.
 *
 *   - Banking         -> 'asset-quality'
 *   - Insurance       -> 'underwriting'
 *   - Capital Markets -> 'earnings-quality'
 *   - Healthcare      -> 'clinical-quality'  (Option B)
 *   - Hospitality     -> 'earningsQuality'   (Option B)
 *   - Remaining 8     -> 'quality'
 */
export const QUALITY_PILLAR_BY_ENGINE_ID: Readonly<Record<string, string>> = Object.freeze({
  [BANKING_ENGINE_ID]: 'asset-quality',
  [INSURANCE_ENGINE_ID]: 'underwriting',
  [CAPITAL_MARKETS_ENGINE_ID]: 'earnings-quality',
  [HEALTHCARE_ENGINE_ID]: 'clinical-quality',
  [HOSPITALITY_ENGINE_ID]: 'earningsQuality',
  [ENERGY_ENGINE_ID]: 'quality',
  [UTILITIES_ENGINE_ID]: 'quality',
  [CONSUMER_ENGINE_ID]: 'quality',
  [INDUSTRIALS_ENGINE_ID]: 'quality',
  [TECHNOLOGY_ENGINE_ID]: 'quality',
  [TELECOM_ENGINE_ID]: 'quality',
  [AUTO_ENGINE_ID]: 'quality',
  [MATERIALS_ENGINE_ID]: 'quality',
});

/**
 * GDS-03 / GDS-04 / GDS-05: Governed growth availability classification and constituent input keys.
 *
 *   - Banking (`sector.banking`): GDS-03 Option B -> unconditionally UNAVAILABLE / null
 *   - Healthcare (`sector.healthcare`): GDS-04 -> unconditionally UNAVAILABLE / null
 *   - Remaining 11 engines: GDS-05 input-backed rule -> if all constituent growth inputs are
 *     undefined or null, UNAVAILABLE / null; otherwise AVAILABLE with runtime growth score.
 */
export const GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID: Readonly<
  Record<string, readonly string[] | null>
> = Object.freeze({
  [BANKING_ENGINE_ID]: null, // GDS-03 Option B: no governed Banking growth metric claimed
  [INSURANCE_ENGINE_ID]: Object.freeze(['IM-003', 'IM-004']),
  [CAPITAL_MARKETS_ENGINE_ID]: Object.freeze(['CM-002', 'CM-006']),
  [HEALTHCARE_ENGINE_ID]: null, // GDS-04: no runtime growth pillar
  [HOSPITALITY_ENGINE_ID]: Object.freeze(['revparGrowth']),
  [ENERGY_ENGINE_ID]: Object.freeze(['productionGrowth', 'revenueGrowth']),
  [UTILITIES_ENGINE_ID]: Object.freeze(['rateBaseGrowth', 'demandGrowth', 'revenueGrowth']),
  [CONSUMER_ENGINE_ID]: Object.freeze(['revenueGrowth', 'dtcShare', 'innovationIntensity']),
  [INDUSTRIALS_ENGINE_ID]: Object.freeze([
    'backlog',
    'orderGrowth',
    'revenueGrowth',
    'IM-006',
    'IM-010',
    'IM-002',
  ]),
  [TECHNOLOGY_ENGINE_ID]: Object.freeze([
    'revenueGrowth',
    'usageGrowth',
    'rdIntensity',
    'TM-002',
    'TM-012',
    'TM-009',
  ]),
  [TELECOM_ENGINE_ID]: Object.freeze(['TL-002', 'TL-003']),
  [AUTO_ENGINE_ID]: Object.freeze(['AU-002', 'AU-003']),
  [MATERIALS_ENGINE_ID]: Object.freeze(['MM-002', 'MM-003']),
});

/**
 * GDS-07 Option 2: Approved 13-sector golden baseline composite identities `(sector, companyId)`.
 * Retained verbatim from frozen IRR reference assets; `("Insurance", "IN-001")` and
 * `("Industrials", "IN-001")` are distinct governed composite identities under `(sector, referenceId)`.
 */
export const GOLDEN_BASELINE_IDENTITIES_BY_SECTOR: Readonly<Record<CanonicalSector, string>> =
  Object.freeze({
    Banking: 'BK-001',
    Insurance: 'IN-001',
    'Capital Markets': 'CM-001',
    Healthcare: 'HC-001',
    Hospitality: 'HP-001',
    Energy: 'EN-001',
    Utilities: 'UT-001',
    Consumer: 'CS-001',
    Industrials: 'IN-001',
    Technology: 'TE-001',
    Telecommunications: 'TL-001',
    Automobile: 'AU-001',
    'Materials & Metals': 'MM-001',
  });

const ENGINE_FACTORY_BY_ID: Readonly<Record<string, () => SectorPlugin>> = Object.freeze({
  [BANKING_ENGINE_ID]: () => new BankingEngine(),
  [INSURANCE_ENGINE_ID]: () => new InsuranceEngine(),
  [CAPITAL_MARKETS_ENGINE_ID]: () => new CapitalMarketsEngine(),
  [HEALTHCARE_ENGINE_ID]: () => new HealthcareEngine(),
  [HOSPITALITY_ENGINE_ID]: () => new HospitalityEngine(),
  [ENERGY_ENGINE_ID]: () => new EnergyEngine(),
  [UTILITIES_ENGINE_ID]: () => new UtilitiesEngine(),
  [CONSUMER_ENGINE_ID]: () => new ConsumerEngine(),
  [INDUSTRIALS_ENGINE_ID]: () => new IndustrialsEngine(),
  [TECHNOLOGY_ENGINE_ID]: () => new TechnologyEngine(),
  [TELECOM_ENGINE_ID]: () => new TelecomEngine(),
  [AUTO_ENGINE_ID]: () => new AutoEngine(),
  [MATERIALS_ENGINE_ID]: () => new MaterialsEngine(),
});

/** Governed provenance attached to a produced Screen member envelope (`GDS-08`, `GDS-09`). */
export interface ScreenProducerProvenance {
  readonly sector: CanonicalSector;
  readonly companyId: string;
  readonly referenceId: string;
  readonly compositeIdentity: PopulationMember;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly snapshotId: string;
  readonly evidenceId: string;
  /** Audit-only timestamp (`request.timestamp ?? snapshot.generatedAt`); excluded from all hashes. */
  readonly timestamp: string;
  /** Optional audit-only requestId; excluded from all hashes. */
  readonly requestId?: string;
}

/** Output of producing a single Screen member through the governed producer adapter. */
export interface ProducedScreenMember {
  /** The canonical `ScreenMemberInput` ready for `NP12MBR` v01 framing and `executeScreen`. */
  readonly memberInput: ScreenMemberInput;
  /** The admitted member returned by the N4-A10 `admitMember` boundary. */
  readonly admittedMember: AdmittedMember;
  /** Explicit numeric/null growth disposition (`null` when `growthAvailability === 'UNAVAILABLE'`). */
  readonly growthValueOrNull: string | null;
  /** Full governed runtime provenance (including audit-only `timestamp` and `requestId`). */
  readonly provenance: ScreenProducerProvenance;
  /** Authoritative snapshot record retrieved from `SnapshotStore.get(result.snapshotRef)`. */
  readonly snapshot: Snapshot;
  /** Raw `ExecutionResult` returned by the sector engine. */
  readonly executionResult: ExecutionResult;
}

/** Request to produce a Screen member by executing the real governed sector engine. */
export interface ScreenProducerRequest {
  /** Canonical sector name (or resolved via `engineId`). */
  readonly sector?: string;
  /** Certified engine identifier (`sector.*`, or resolved via `sector`). */
  readonly engineId?: string;
  /** Caller-bound company identity (`GDS-07`: `request.companyId` or `inputs.companyId`). */
  readonly companyId?: string;
  /** Optional referenceId; if supplied, must match `companyId` byte-for-byte (`GDS-07`). */
  readonly referenceId?: string;
  /** Raw engine input record passed to the real sector engine. */
  readonly inputs: Readonly<Record<string, unknown>>;
  /** Optional audit-only requestId (never enters any Screen identity preimage). */
  readonly requestId?: string;
  /** Optional audit-only timestamp (never enters any Screen identity preimage). */
  readonly timestamp?: string;
  /** Optional EngineRegistry lookup override (defaults to `DEFAULT_ENGINE_REGISTRY`). */
  readonly registry?: EngineRegistryLookup;
}

/** Context for adapting an already-executed sector engine `ExecutionResult` + `SnapshotStore`. */
export interface AdaptExecutionResultInput {
  readonly engineId: string;
  readonly sector?: string;
  readonly companyId?: string;
  readonly referenceId?: string;
  readonly inputs: Readonly<Record<string, unknown>>;
  readonly result: ExecutionResult;
  readonly snapshotStore: SnapshotStore;
  readonly requestId?: string;
  readonly timestamp?: string;
  readonly registry?: EngineRegistryLookup;
}

/* ------------------------------------------------------------------ *
 * Phase E — GDS-06 Decimal Canonicalization (6dp Round-Half-to-Even)
 * ------------------------------------------------------------------ */

function parseScientificToScaledBigInt(scientific: string, scaleExponent: number): bigint {
  const [coeff, expPart] = scientific.split(/e/i);
  const exp = expPart !== undefined ? Number.parseInt(expPart, 10) : 0;
  const [intPart, fracPart = ''] = coeff.split('.');
  const digits = (intPart + fracPart).replace(/^0+/, '') || '0';
  if (digits === '0') return 0n;
  const decimalShift = exp - fracPart.length + scaleExponent;
  if (decimalShift >= 0) {
    return BigInt(digits + '0'.repeat(decimalShift));
  }
  const cut = digits.length + decimalShift;
  if (cut <= 0) return 0n;
  return BigInt(digits.slice(0, cut));
}

/**
 * GDS-06 Option A — Convert a runtime numeric score in `[0, 100]` to canonical decimal text
 * and exact fixed-point `q` (`10^6` scale) using deterministic round-half-to-even, stripping
 * trailing fractional zeroes, and verifying conformance with the N4-A6 canonical grammar.
 *
 * Rejects non-finite values (`NaN`, `±Infinity`, non-numbers) and out-of-range values
 * (`< 0` or `> 100`).
 */
export function canonicalizeRuntimeDecimal(value: unknown): {
  readonly text: string;
  readonly q: bigint;
} {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ScreenProducerError(
      'PRODUCER_DECIMAL_NON_FINITE',
      `Runtime score must be a finite number (received ${String(value)})`,
    );
  }
  if (Object.is(value, -0) || value === 0) {
    return { text: '0', q: 0n };
  }
  if (value < 0 || value > 100) {
    throw new ScreenProducerError(
      'PRODUCER_DECIMAL_OUT_OF_RANGE',
      `Runtime score ${String(value)} is outside the governed domain [0, 100]`,
    );
  }

  // Normalize IEEE-754 binary64 float to its 15-significant-digit decimal representation
  // so binary representation artifacts (e.g. 77.03999999999999 -> 77.04) are eliminated
  // before exact integer round-half-to-even at scale 10^6.
  const EXTRA_EXP = 18;
  const UNIT = 10n ** 18n;
  const HALF = 5n * 10n ** 17n;
  const scaled = parseScientificToScaledBigInt(value.toPrecision(15), 6 + EXTRA_EXP);
  let q = scaled / UNIT;
  const remainder = scaled % UNIT;
  if (remainder > HALF || (remainder === HALF && (q & 1n) === 1n)) {
    q += 1n;
  }

  if (q < 0n || q > DECIMAL_MAX_Q) {
    throw new ScreenProducerError(
      'PRODUCER_DECIMAL_OUT_OF_RANGE',
      `Rounded fixed-point score q=${q.toString()} is outside [0, ${DECIMAL_MAX_Q.toString()}]`,
    );
  }

  const text = canonicalDecimalText(q);
  // Verify through the N4-A10 Screen-side canonical decimal inspector so that no value
  // can ever cross the boundary without satisfying A6 §6.
  const verified = requireCanonicalDecimal(text);
  return { text: verified.text, q: verified.q };
}

/* ------------------------------------------------------------------ *
 * Phase F — GDS-07 Caller/Request-Bound Identity & Sector-Scoped Key
 * ------------------------------------------------------------------ */

const SYNTHETIC_SECTOR_H1_PATTERN = /^(?:Banking|Insurance|Capital Markets|Healthcare|Hospitality|Energy|Utilities|Consumer|Industrials|Technology|Telecommunications|Automobile|Materials & Metals)-H1$/i;

function validateIdentityToken(token: unknown, label: string): string {
  if (typeof token !== 'string') {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_MISSING',
      `Required ${label} must be a non-empty string`,
    );
  }
  if (token.length === 0 || token.trim().length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_INVALID',
      `${label} must not be empty or whitespace-only`,
    );
  }
  if (token !== token.trim()) {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_INVALID',
      `${label} must not contain leading or trailing whitespace`,
    );
  }
  for (let i = 0; i < token.length; i += 1) {
    const code = token.charCodeAt(i);
    if (code <= 0x1f || code >= 0x7f) {
      throw new ScreenProducerError(
        'PRODUCER_IDENTITY_INVALID',
        `${label} must contain only printable ASCII characters (0x20..0x7E)`,
      );
    }
  }
  if (SYNTHETIC_SECTOR_H1_PATTERN.test(token)) {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_INVALID',
      `Synthetic ${label} token "${token}" (\${sector}-H1 pattern) is prohibited by GDS-07`,
    );
  }
  return token;
}

/**
 * Resolve and validate caller/request-bound `companyId` and `referenceId` (`GDS-07`),
 * returning the sector-scoped composite member identity `(sector, referenceId)`.
 */
export function resolveCallerMemberIdentity(params: {
  readonly sector: CanonicalSector;
  readonly requestCompanyId?: unknown;
  readonly requestReferenceId?: unknown;
  readonly inputs: Readonly<Record<string, unknown>>;
}): {
  readonly companyId: string;
  readonly referenceId: string;
  readonly compositeIdentity: PopulationMember;
} {
  const { sector, requestCompanyId, requestReferenceId, inputs } = params;
  const inputCompanyId = inputs.companyId;
  const inputReferenceId = inputs.referenceId;

  const hasReqCompanyId = requestCompanyId !== undefined && requestCompanyId !== null;
  const hasInpCompanyId = inputCompanyId !== undefined && inputCompanyId !== null;

  if (!hasReqCompanyId && !hasInpCompanyId) {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_MISSING',
      'GDS-07 requires caller/request-bound companyId in request.companyId or inputs.companyId',
    );
  }

  const validatedReqCompanyId = hasReqCompanyId
    ? validateIdentityToken(requestCompanyId, 'request.companyId')
    : undefined;
  const validatedInpCompanyId = hasInpCompanyId
    ? validateIdentityToken(inputCompanyId, 'inputs.companyId')
    : undefined;

  if (
    validatedReqCompanyId !== undefined &&
    validatedInpCompanyId !== undefined &&
    validatedReqCompanyId !== validatedInpCompanyId
  ) {
    throw new ScreenProducerError(
      'PRODUCER_IDENTITY_MISMATCH',
      `request.companyId ("${validatedReqCompanyId}") does not match inputs.companyId ("${validatedInpCompanyId}")`,
    );
  }

  const companyId = (validatedReqCompanyId ?? validatedInpCompanyId)!;

  // If optional referenceId is supplied in request or inputs, it must match companyId.
  for (const [candidate, label] of [
    [requestReferenceId, 'request.referenceId'],
    [inputReferenceId, 'inputs.referenceId'],
  ] as const) {
    if (candidate !== undefined && candidate !== null) {
      const validatedRef = validateIdentityToken(candidate, label);
      if (validatedRef !== companyId) {
        throw new ScreenProducerError(
          'PRODUCER_IDENTITY_MISMATCH',
          `${label} ("${validatedRef}") does not match companyId ("${companyId}")`,
        );
      }
    }
  }

  // If the underlying input record carries a non-empty `id` field (e.g. golden dataset input),
  // verify it does not conflict with the caller-bound companyId.
  if (inputs.id !== undefined && inputs.id !== null) {
    const inputId = validateIdentityToken(inputs.id, 'inputs.id');
    if (inputId !== companyId) {
      throw new ScreenProducerError(
        'PRODUCER_IDENTITY_MISMATCH',
        `inputs.id ("${inputId}") conflicts with caller-bound companyId ("${companyId}")`,
      );
    }
  }

  return {
    companyId,
    referenceId: companyId,
    compositeIdentity: Object.freeze({
      sector,
      referenceId: companyId,
    }),
  };
}

/* ------------------------------------------------------------------ *
 * Phase D — GDS-01, GDS-02, GDS-03, GDS-04, GDS-05
 * ------------------------------------------------------------------ */

/**
 * Retrieve the supporting pillar score map from an authoritative `Snapshot` (`GDS-01`).
 *
 * In `SnapshotService.ts:19,41`, `runtime.recordSnapshot(engineId, metrics, score.pillars, verdict)`
 * stores `score.pillars` on `snapshot.scores`. For compatibility with callers or tests that
 * also expose `supportingScores` on a snapshot-like object, both `snapshot.scores` and
 * `snapshot.supportingScores` are inspected.
 */
export function extractSnapshotSupportingScores(
  snapshot: Snapshot | (Snapshot & { readonly supportingScores?: unknown }),
): Readonly<Record<string, number>> {
  const record = snapshot as unknown as Record<string, unknown>;
  const rawScores = record.supportingScores ?? record.scores;
  if (rawScores === undefined || rawScores === null || typeof rawScores !== 'object') {
    throw new ScreenProducerError(
      'PRODUCER_SUPPORTING_SCORES_MISSING',
      `Snapshot "${snapshot.snapshotId}" does not contain supporting pillar scores`,
    );
  }

  if (Array.isArray(rawScores)) {
    const mapped: Record<string, number> = {};
    for (const item of rawScores) {
      if (
        item !== null &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { value?: unknown }).value === 'number'
      ) {
        mapped[(item as { id: string }).id] = (item as { value: number }).value;
      }
    }
    if (Object.keys(mapped).length === 0) {
      throw new ScreenProducerError(
        'PRODUCER_SUPPORTING_SCORES_MISSING',
        `Snapshot "${snapshot.snapshotId}" has an empty supportingScores array`,
      );
    }
    return Object.freeze(mapped);
  }

  const scoreMap = rawScores as Record<string, unknown>;
  if (Object.keys(scoreMap).length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_SUPPORTING_SCORES_MISSING',
      `Snapshot "${snapshot.snapshotId}" has an empty supporting scores record`,
    );
  }
  return scoreMap as Readonly<Record<string, number>>;
}

/**
 * GDS-02: Map the engine's runtime supporting pillar scores to the governed Screen `quality` score.
 */
export function extractEngineQualityScore(
  engineId: string,
  supportingScores: Readonly<Record<string, number>>,
): { readonly pillarKey: string; readonly rawValue: number; readonly text: string; readonly q: bigint } {
  const pillarKey = QUALITY_PILLAR_BY_ENGINE_ID[engineId];
  if (!pillarKey) {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_UNRESOLVED',
      `No governed GDS-02 quality pillar mapping exists for engine "${engineId}"`,
    );
  }
  const rawValue = supportingScores[pillarKey];
  if (rawValue === undefined || rawValue === null) {
    throw new ScreenProducerError(
      'PRODUCER_QUALITY_INVALID',
      `Snapshot supporting scores for "${engineId}" are missing required quality pillar "${pillarKey}"`,
    );
  }
  const canonical = canonicalizeRuntimeDecimal(rawValue);
  return {
    pillarKey,
    rawValue,
    text: canonical.text,
    q: canonical.q,
  };
}

/**
 * GDS-03 / GDS-04 / GDS-05: Determine `growthAvailability` and canonical `growth` text
 * (or `null` when `UNAVAILABLE`).
 */
export function evaluateEngineGrowthDisposition(
  engineId: string,
  inputs: Readonly<Record<string, unknown>>,
  supportingScores: Readonly<Record<string, number>>,
): {
  readonly growthAvailability: GrowthAvailability;
  readonly growth: string | null;
  readonly q: bigint | null;
} {
  if (!(engineId in GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID)) {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_UNRESOLVED',
      `No governed growth availability rule exists for engine "${engineId}"`,
    );
  }

  // GDS-03 Option B (Banking) & GDS-04 (Healthcare): unconditionally UNAVAILABLE / null.
  const constituentKeys = GROWTH_CONSTITUENT_INPUT_KEYS_BY_ENGINE_ID[engineId];
  if (constituentKeys === null) {
    return {
      growthAvailability: 'UNAVAILABLE',
      growth: null,
      q: null,
    };
  }

  // GDS-05 (11 input-backed engines): check whether at least one governed growth constituent
  // input is defined and non-null in the supplied input record.
  const hasAnyGrowthInput = constituentKeys.some(
    (key) => inputs[key] !== undefined && inputs[key] !== null,
  );

  if (!hasAnyGrowthInput) {
    return {
      growthAvailability: 'UNAVAILABLE',
      growth: null,
      q: null,
    };
  }

  const rawGrowth = supportingScores.growth;
  if (rawGrowth === undefined || rawGrowth === null) {
    throw new ScreenProducerError(
      'PRODUCER_GROWTH_INVALID',
      `Engine "${engineId}" has available growth inputs but snapshot supporting scores are missing "growth"`,
    );
  }

  const canonical = canonicalizeRuntimeDecimal(rawGrowth);
  return {
    growthAvailability: 'AVAILABLE',
    growth: canonical.text,
    q: canonical.q,
  };
}

/* ------------------------------------------------------------------ *
 * Phase G — GDS-08 Engine Metadata Resolution via EngineRegistry
 * ------------------------------------------------------------------ */

function resolveEngineAndSector(
  sector: string | undefined,
  engineId: string | undefined,
  registry: EngineRegistryLookup,
): {
  readonly canonicalSector: CanonicalSector;
  readonly registryEntry: EngineRegistryEntry;
} {
  let entryByEngineId: EngineRegistryEntry | undefined;
  let entryBySector: EngineRegistryEntry | undefined;

  if (engineId !== undefined) {
    if (typeof engineId !== 'string' || engineId.trim().length === 0) {
      throw new ScreenProducerError('PRODUCER_ENGINE_UNRESOLVED', 'engineId must be a non-empty string');
    }
    entryByEngineId = registry.getEngine(engineId);
    if (!entryByEngineId) {
      throw new ScreenProducerError(
        'PRODUCER_ENGINE_UNRESOLVED',
        `EngineRegistry.getEngine("${engineId}") returned no certified engine entry`,
      );
    }
  }

  if (sector !== undefined) {
    if (typeof sector !== 'string' || !CANONICAL_SCREEN_SECTORS.includes(sector)) {
      throw new ScreenProducerError(
        'PRODUCER_SECTOR_INVALID',
        `Sector must be one of the 13 canonical sectors (received ${JSON.stringify(sector)})`,
      );
    }
    entryBySector = registry.getEngineForSector
      ? registry.getEngineForSector(sector)
      : CERTIFIED_ENGINES.find((e) => e.sectorFamily === sector);
    if (!entryBySector) {
      throw new ScreenProducerError(
        'PRODUCER_ENGINE_UNRESOLVED',
        `No certified engine entry found for canonical sector "${sector}"`,
      );
    }
  }

  if (!entryByEngineId && !entryBySector) {
    throw new ScreenProducerError(
      'PRODUCER_REQUEST_MALFORMED',
      'Producer request must specify at least one of sector or engineId',
    );
  }

  if (entryByEngineId && entryBySector && entryByEngineId.engineId !== entryBySector.engineId) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `Supplied sector "${sector}" (${entryBySector.engineId}) conflicts with supplied engineId "${engineId}" (${entryByEngineId.sectorFamily})`,
    );
  }

  const resolved = (entryByEngineId ?? entryBySector)!;
  if (
    typeof resolved.engineId !== 'string' ||
    resolved.engineId.trim().length === 0 ||
    (engineId !== undefined && resolved.engineId !== engineId)
  ) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `EngineRegistry entry engineId mismatch for "${String(engineId ?? sector)}"`,
    );
  }
  if (
    typeof resolved.sectorFamily !== 'string' ||
    !CANONICAL_SCREEN_SECTORS.includes(resolved.sectorFamily)
  ) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `EngineRegistry entry sectorFamily "${String(resolved.sectorFamily)}" is not a canonical Screen sector`,
    );
  }
  if (typeof resolved.engineVersion !== 'string' || resolved.engineVersion.trim().length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `EngineRegistry entry for "${resolved.engineId}" is missing authoritative engineVersion`,
    );
  }
  if (
    typeof resolved.calibrationVersion !== 'string' ||
    resolved.calibrationVersion.trim().length === 0
  ) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `EngineRegistry entry for "${resolved.engineId}" is missing authoritative calibrationVersion`,
    );
  }

  return {
    canonicalSector: resolved.sectorFamily as CanonicalSector,
    registryEntry: resolved,
  };
}

/* ------------------------------------------------------------------ *
 * Phase H & I — Adaptation & Real Engine Execution Boundary
 * ------------------------------------------------------------------ */

/**
 * Adapt an authoritative sector-engine `ExecutionResult` + `SnapshotStore` into a
 * governed `ProducedScreenMember` (`GDS-01`..`GDS-10`).
 */
export function adaptExecutionResultToScreenMember(
  context: AdaptExecutionResultInput,
): ProducedScreenMember {
  if (!context || typeof context !== 'object') {
    throw new ScreenProducerError('PRODUCER_REQUEST_MALFORMED', 'Adaptation context must be an object');
  }
  const {
    engineId,
    sector,
    companyId,
    referenceId,
    inputs,
    result,
    snapshotStore,
    requestId,
    timestamp,
    registry = DEFAULT_ENGINE_REGISTRY,
  } = context;

  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new ScreenProducerError('PRODUCER_REQUEST_MALFORMED', 'inputs must be a non-null record');
  }
  if (!result || typeof result !== 'object') {
    throw new ScreenProducerError('PRODUCER_ENGINE_EXECUTION_FAILED', 'ExecutionResult is required');
  }
  if (result.state !== 'COMPLETED') {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_EXECUTION_FAILED',
      `Sector engine execution did not complete (state=${String(result.state)})`,
    );
  }

  // GDS-08: Resolve and verify authoritative engine metadata from EngineRegistry.
  const { canonicalSector, registryEntry } = resolveEngineAndSector(sector, engineId, registry);

  // Verify runtime metadata calibrationVersion if the engine emitted one.
  const resultMetadata = (result.metadata ?? {}) as Record<string, unknown>;
  if (
    resultMetadata.calibrationVersion !== undefined &&
    resultMetadata.calibrationVersion !== null &&
    String(resultMetadata.calibrationVersion) !== registryEntry.calibrationVersion
  ) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `Runtime calibrationVersion "${String(resultMetadata.calibrationVersion)}" does not match EngineRegistry calibrationVersion "${registryEntry.calibrationVersion}"`,
    );
  }

  // GDS-07: Validate caller/request-bound companyId and construct sector-scoped (sector, referenceId).
  const identity = resolveCallerMemberIdentity({
    sector: canonicalSector,
    requestCompanyId: companyId,
    requestReferenceId: referenceId,
    inputs,
  });

  // GDS-09: Verify authoritative snapshotRef and evidenceRef provenance.
  const snapshotRef = result.snapshotRef;
  const evidenceRef = result.evidenceRef;
  if (typeof snapshotRef !== 'string' || snapshotRef.trim().length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_PROVENANCE_MISSING',
      `ExecutionResult for "${registryEntry.engineId}" is missing snapshotRef`,
    );
  }
  if (typeof evidenceRef !== 'string' || evidenceRef.trim().length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_PROVENANCE_MISSING',
      `ExecutionResult for "${registryEntry.engineId}" is missing evidenceRef`,
    );
  }
  if (!snapshotStore || typeof snapshotStore.get !== 'function') {
    throw new ScreenProducerError(
      'PRODUCER_SNAPSHOT_MISSING',
      'An authoritative SnapshotStore instance is required',
    );
  }

  // GDS-01: Retrieve authoritative Snapshot from SnapshotStore.get(snapshotRef).
  const snapshot = snapshotStore.get(snapshotRef);
  if (!snapshot) {
    throw new ScreenProducerError(
      'PRODUCER_SNAPSHOT_MISSING',
      `SnapshotStore.get("${snapshotRef}") returned undefined`,
    );
  }
  if (snapshot.snapshotId !== snapshotRef) {
    throw new ScreenProducerError(
      'PRODUCER_SNAPSHOT_MISSING',
      `Snapshot ID mismatch: expected "${snapshotRef}", got "${snapshot.snapshotId}"`,
    );
  }
  if (snapshot.engineId !== registryEntry.engineId) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `Snapshot engineId "${snapshot.engineId}" does not match EngineRegistry engineId "${registryEntry.engineId}"`,
    );
  }

  // Extract runtime supporting scores from the authoritative snapshot.
  const supportingScores = extractSnapshotSupportingScores(snapshot);

  // Conviction comes from runtime result.metadata.composite, canonicalized via GDS-06.
  if (resultMetadata.composite === undefined || resultMetadata.composite === null) {
    throw new ScreenProducerError(
      'PRODUCER_CONVICTION_INVALID',
      `ExecutionResult.metadata.composite is missing for engine "${registryEntry.engineId}"`,
    );
  }
  const conviction = canonicalizeRuntimeDecimal(resultMetadata.composite);

  // GDS-02: Map domain quality pillar to Screen quality, canonicalized via GDS-06.
  const quality = extractEngineQualityScore(registryEntry.engineId, supportingScores);

  // GDS-03 / GDS-04 / GDS-05: Evaluate growth availability and canonical growth text.
  const growthDisposition = evaluateEngineGrowthDisposition(
    registryEntry.engineId,
    inputs,
    supportingScores,
  );

  // Construct governed ScreenMemberInput (A6 §7.2).
  const memberInput: ScreenMemberInput = Object.freeze({
    sector: canonicalSector,
    referenceId: identity.referenceId,
    conviction: conviction.text,
    quality: quality.text,
    growthAvailability: growthDisposition.growthAvailability,
    ...(growthDisposition.growthAvailability === 'AVAILABLE' && growthDisposition.growth !== null
      ? { growth: growthDisposition.growth }
      : {}),
    engineId: registryEntry.engineId,
    engineVersion: registryEntry.engineVersion,
    calibrationVersion: registryEntry.calibrationVersion,
    snapshotId: snapshot.snapshotId,
    evidenceId: evidenceRef,
  });

  // Pass through the N4-A10 validation/admission boundary.
  const admission = admitMember(memberInput);
  if (admission.structural !== null || admission.member === null) {
    throw new ScreenProducerError(
      'PRODUCER_ADMISSION_FAILED',
      `A10 structural admission rejected produced member: ${admission.structural?.message ?? 'unknown'}`,
    );
  }
  if (admission.member.status !== 'VALID' || admission.member.errorCode !== '') {
    throw new ScreenProducerError(
      'PRODUCER_ADMISSION_FAILED',
      `A10 member admission marked produced member invalid (${admission.member.errorCode})`,
    );
  }

  const effectiveTimestamp =
    typeof timestamp === 'string' && timestamp.trim().length > 0
      ? timestamp
      : snapshot.generatedAt;
  if (typeof effectiveTimestamp !== 'string' || effectiveTimestamp.trim().length === 0) {
    throw new ScreenProducerError(
      'PRODUCER_PROVENANCE_MISSING',
      'Audit timestamp provenance is missing from both request and snapshot',
    );
  }

  const provenance: ScreenProducerProvenance = Object.freeze({
    sector: canonicalSector,
    companyId: identity.companyId,
    referenceId: identity.referenceId,
    compositeIdentity: identity.compositeIdentity,
    engineId: registryEntry.engineId,
    engineVersion: registryEntry.engineVersion,
    calibrationVersion: registryEntry.calibrationVersion,
    snapshotId: snapshot.snapshotId,
    evidenceId: evidenceRef,
    timestamp: effectiveTimestamp,
    ...(typeof requestId === 'string' && requestId.length > 0 ? { requestId } : {}),
  });

  return Object.freeze({
    memberInput,
    admittedMember: admission.member,
    growthValueOrNull: growthDisposition.growth,
    provenance,
    snapshot,
    executionResult: result,
  });
}

/**
 * Execute the real certified sector engine for a single member request and adapt its
 * runtime output into a governed `ProducedScreenMember`.
 *
 * Uses a deterministic `FixedClock` and `DeterministicIdProvider` seeded by the governed
 * `(sector, companyId)` composite identity (never `Date.now()`, `Math.random()`, `timestamp`,
 * or `requestId`), ensuring that `snapshotId`, `evidenceId`, `inputHash`, `executionId`, and
 * `resultId` are 100% deterministic and invariant under `timestamp` / `requestId` variation.
 */
export function produceScreenMember(request: ScreenProducerRequest): ProducedScreenMember {
  if (!request || typeof request !== 'object') {
    throw new ScreenProducerError('PRODUCER_REQUEST_MALFORMED', 'Producer request must be an object');
  }
  const registry = request.registry ?? DEFAULT_ENGINE_REGISTRY;
  const { canonicalSector, registryEntry } = resolveEngineAndSector(
    request.sector,
    request.engineId,
    registry,
  );

  if (!request.inputs || typeof request.inputs !== 'object' || Array.isArray(request.inputs)) {
    throw new ScreenProducerError('PRODUCER_REQUEST_MALFORMED', 'request.inputs must be a record');
  }

  // Validate caller-bound identity BEFORE invoking the sector engine (fail-closed GDS-07).
  const identity = resolveCallerMemberIdentity({
    sector: canonicalSector,
    requestCompanyId: request.companyId,
    requestReferenceId: request.referenceId,
    inputs: request.inputs,
  });

  const makePlugin = ENGINE_FACTORY_BY_ID[registryEntry.engineId];
  if (!makePlugin) {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_UNRESOLVED',
      `No certified sector-engine plugin constructor bound for "${registryEntry.engineId}"`,
    );
  }

  const plugin = makePlugin();
  if (
    plugin.identity.engineId !== registryEntry.engineId ||
    plugin.identity.engineVersion !== registryEntry.engineVersion
  ) {
    throw new ScreenProducerError(
      'PRODUCER_METADATA_INVALID',
      `Sector plugin identity (${plugin.identity.engineId}@${plugin.identity.engineVersion}) does not match EngineRegistry (${registryEntry.engineId}@${registryEntry.engineVersion})`,
    );
  }

  // Build isolated deterministic platform runtime for this member execution.
  // Seeded by canonical (sector, companyId) — never by audit-only requestId or timestamp.
  const clock = new FixedClock(DEFAULT_PRODUCER_CLOCK_EPOCH);
  const idProvider = new DeterministicIdProvider(`${canonicalSector}:${identity.companyId}`);
  const evidencePipeline = new EvidencePipeline(clock);
  const container = new Container({
    clock,
    idProvider,
    evidenceService: evidencePipeline,
  });
  const pluginLoader = new PluginLoader(container);
  const snapshotService = new SnapshotService(clock, idProvider, 'snapshot-1.0');
  const snapshotStore = new SnapshotStore();
  const replayService = new ReplayService(snapshotStore);
  const runtime = new RuntimeCoordinator(
    container,
    pluginLoader,
    snapshotService,
    snapshotStore,
    replayService,
  );
  container.register('runtimeCoordinator', runtime);

  const loaded = pluginLoader.load(plugin);
  if (!loaded) {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_EXECUTION_FAILED',
      `Failed to load sector engine plugin "${registryEntry.engineId}"`,
    );
  }
  pluginLoader.initialize(registryEntry.engineId);

  const engineRequestId =
    typeof request.requestId === 'string' && request.requestId.trim().length > 0
      ? request.requestId
      : `screen-producer:${canonicalSector}:${identity.companyId}`;
  const executionRequest: ExecutionRequest = {
    requestId: engineRequestId,
    inputs: request.inputs,
  };

  let result: ExecutionResult;
  try {
    result = runtime.execute(registryEntry.engineId, executionRequest).result;
  } catch (err) {
    throw new ScreenProducerError(
      'PRODUCER_ENGINE_EXECUTION_FAILED',
      `Engine "${registryEntry.engineId}" threw during execution: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return adaptExecutionResultToScreenMember({
    engineId: registryEntry.engineId,
    sector: canonicalSector,
    companyId: identity.companyId,
    referenceId: request.referenceId,
    inputs: request.inputs,
    result,
    snapshotStore,
    requestId: request.requestId,
    timestamp: request.timestamp,
    registry,
  });
}

/** Produce an array of governed `ProducedScreenMember` records from an array of requests. */
export function produceScreenMembers(
  requests: readonly ScreenProducerRequest[],
): readonly ProducedScreenMember[] {
  if (!Array.isArray(requests)) {
    throw new ScreenProducerError(
      'PRODUCER_REQUEST_MALFORMED',
      'requests must be an explicit array of ScreenProducerRequest objects',
    );
  }
  return Object.freeze(requests.map((req) => produceScreenMember(req)));
}

/**
 * Produce Screen members via the real sector engines and evaluate them through the
 * N4-A10 `executeScreen` runtime boundary.
 */
export function executeProducedScreen(params: {
  readonly definition: ScreenDefinition;
  readonly requests: readonly ScreenProducerRequest[];
  readonly timestamp?: string;
  readonly requestId?: string;
}): {
  readonly producedMembers: readonly ProducedScreenMember[];
  readonly execution: ScreenExecution;
  readonly result: ScreenResult;
} {
  const producedMembers = produceScreenMembers(params.requests);
  const memberInputs = producedMembers.map((m) => m.memberInput);
  const { execution, result } = executeScreen({
    definition: params.definition,
    members: memberInputs,
    ...(typeof params.timestamp === 'string' ? { timestamp: params.timestamp } : {}),
    ...(typeof params.requestId === 'string' ? { requestId: params.requestId } : {}),
  });
  return Object.freeze({
    producedMembers,
    execution,
    result,
  });
}

/** Object-oriented facade for callers preferring a class instance (`ScreenProducerAdapter`). */
export class ScreenProducerAdapter {
  constructor(private readonly registry: EngineRegistryLookup = DEFAULT_ENGINE_REGISTRY) {}

  produceMember(request: ScreenProducerRequest): ProducedScreenMember {
    return produceScreenMember({ ...request, registry: request.registry ?? this.registry });
  }

  produceMembers(requests: readonly ScreenProducerRequest[]): readonly ProducedScreenMember[] {
    return produceScreenMembers(
      requests.map((req) => ({ ...req, registry: req.registry ?? this.registry })),
    );
  }

  adaptExecutionResult(context: AdaptExecutionResultInput): ProducedScreenMember {
    return adaptExecutionResultToScreenMember({
      ...context,
      registry: context.registry ?? this.registry,
    });
  }

  executeScreen(params: {
    readonly definition: ScreenDefinition;
    readonly requests: readonly ScreenProducerRequest[];
    readonly timestamp?: string;
    readonly requestId?: string;
  }): {
    readonly producedMembers: readonly ProducedScreenMember[];
    readonly execution: ScreenExecution;
    readonly result: ScreenResult;
  } {
    return executeProducedScreen({
      ...params,
      requests: params.requests.map((req) => ({ ...req, registry: req.registry ?? this.registry })),
    });
  }
}

export { CANONICAL_SECTORS, type CanonicalSector };
