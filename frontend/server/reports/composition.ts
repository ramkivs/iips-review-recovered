/**
 * Program v3.0 — NP-06 Reports: product-tier composition.
 *
 * NP-06 §5.5 defines the composition boundary:
 *   Frozen CSIP `ReportingEngine` → product-tier Reports composition → governed artifact
 *     → persistence → product projections.
 *
 * This module is the composition stage only. It treats the frozen engine's output as **read-only
 * input** and never modifies, relocates, or re-implements the engine.
 *
 * It produces `ReportContent` — content, not instance identity. Under NP-06 §5.1 `createInstance`
 * assigns `reportId` and `artifactVersion`, so the composer deliberately mints neither. The only
 * identifier this module derives is `reportKey`, which is CONTENT identity.
 */
import {
  CANONICAL_SCHEMA_VERSION,
  canonicalizePayload,
  deriveReportKey,
  type CanonicalParameterValue,
} from './canonical.js';
import {
  ReportValidationError,
  engineContentId,
  validateGeneratedAt,
  validateCanonicalMembers,
  type ReportContent,
  type ReportOwnership,
  type ReportProvenance,
} from './artifact.js';

/**
 * The frozen engine's output, as consumed here.
 *
 * Structurally typed rather than imported so that composition depends only on the engine's
 * *contract*, never on its internals. `reports-artifact.test.ts` drives the REAL frozen
 * `ReportingEngine` to prove this contract matches its actual output.
 */
export interface FrozenReportingEngineOutput {
  /** The engine's content-derived identifier. Read as provenance; never used as durable identity. */
  readonly reportId: string;
  readonly reportType: string;
  readonly portfolioId: string;
  readonly payload: unknown;
}

export interface ComposeReportContentInput {
  /** Output of the frozen CSIP `ReportingEngine`. Read-only input; never mutated. */
  readonly engineOutput: FrozenReportingEngineOutput;
  /**
   * Explicit generation instant. D3 requires `generatedAt` to be explicit, and omitting it keeps
   * composition deterministic and clock-free.
   */
  readonly generatedAt: string;
  /** Optional canonical member. Defaults to the engine payload's scenario when that is a string. */
  readonly scenario?: string | null;
  /** Optional canonical member. Flat primitives only (§5.2 rule 4). */
  readonly parameters?: Readonly<Record<string, CanonicalParameterValue>> | null;
  /** Defaults to `CANONICAL_SCHEMA_VERSION`. */
  readonly schemaVersion?: number;
  /** Additional provenance merged over the engine reference. Must not displace `engineOutputId`. */
  readonly provenance?: Readonly<Record<string, unknown>>;
}

function requireEngineOutput(value: unknown): FrozenReportingEngineOutput {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ReportValidationError('engineOutput must be an object', {});
  }
  const o = value as Record<string, unknown>;
  if (typeof o.reportId !== 'string' || o.reportId.length === 0) {
    throw new ReportValidationError('engineOutput.reportId must be a non-empty string', {});
  }
  if (typeof o.reportType !== 'string' || o.reportType.length === 0) {
    throw new ReportValidationError('engineOutput.reportType must be a non-empty string', {});
  }
  if (typeof o.portfolioId !== 'string' || o.portfolioId.length === 0) {
    throw new ReportValidationError('engineOutput.portfolioId must be a non-empty string', {});
  }
  if (!('payload' in o)) {
    throw new ReportValidationError('engineOutput.payload is required', {});
  }
  return o as unknown as FrozenReportingEngineOutput;
}

/** Read the engine payload's scenario, accepting only a non-empty string or absent. */
function scenarioFromPayload(payload: unknown): string | null {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const s = (payload as Record<string, unknown>).scenario;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

/**
 * Compose canonical report content from a frozen `ReportingEngine` output.
 *
 * Fail-closed throughout: an inconsistent engine output, a malformed `generatedAt`, an invalid
 * canonical member, or a non-canonicalizable payload is rejected rather than coerced.
 */
export function composeReportContent(input: ComposeReportContentInput): ReportContent {
  if (input === null || typeof input !== 'object') {
    throw new ReportValidationError('composition input must be an object', {});
  }
  const output = requireEngineOutput(input.engineOutput);

  // The engine's own identifier is a REFERENCE to its output. If it is not the form this engine
  // is known to produce for these inputs, the output is inconsistent and composition must stop.
  const expectedEngineId = engineContentId(output.reportType, output.portfolioId);
  if (output.reportId !== expectedEngineId) {
    throw new ReportValidationError(
      'engineOutput.reportId does not match the frozen ReportingEngine identifier form',
      { reportId: output.reportId, expected: expectedEngineId },
    );
  }

  // Canonical members. Scenario defaults from the engine payload; an explicit value wins.
  const scenario = input.scenario === undefined ? scenarioFromPayload(output.payload) : input.scenario;
  const members = validateCanonicalMembers({
    reportType: output.reportType,
    portfolioId: output.portfolioId,
    scenario,
    parameters: input.parameters ?? null,
  });

  const generatedAt = validateGeneratedAt(input.generatedAt);

  const schemaVersion = input.schemaVersion ?? CANONICAL_SCHEMA_VERSION;
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new ReportValidationError('schemaVersion must be an integer >= 1', { schemaVersion });
  }

  // Canonical structured payload (R5: the canonical form; UI/export are projections).
  const canonicalPayload = canonicalizePayload(output.payload);

  // Provenance always carries the engine reference; caller metadata is merged in but cannot
  // displace the engine reference.
  const provenance: ReportProvenance = {
    ...(input.provenance ?? {}),
    engineOutputId: output.reportId,
  };

  return {
    reportType: members.reportType,
    portfolioId: members.portfolioId,
    scenario: members.scenario ?? null,
    parameters: members.parameters ?? null,
    schemaVersion,
    generatedAt,
    canonicalPayload,
    provenance,
    reportKey: deriveReportKey(members),
  };
}

/**
 * Ownership for a report, derived solely from the authenticated principal.
 *
 * There is deliberately no parameter through which a caller can supply an owner: per R2/§5.3
 * ownership equals the creating principal and is immutable.
 */
export function ownershipFor(principal: { readonly tenantId: string; readonly userId: string }): ReportOwnership {
  if (principal === null || typeof principal !== 'object') {
    throw new ReportValidationError('principal is required', {});
  }
  const { tenantId, userId } = principal;
  if (typeof tenantId !== 'string' || tenantId.length === 0) {
    throw new ReportValidationError('principal.tenantId must be a non-empty string', {});
  }
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new ReportValidationError('principal.userId must be a non-empty string', {});
  }
  return { tenantId, userId };
}
