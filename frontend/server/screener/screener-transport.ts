/**
 * Governed Screener application transport (read-only, non-authoritative compute).
 *
 * Exposes the certified N4 Screen runtime (N4-SD / N4-A10 / N4-A13) over HTTP without
 * modifying it:
 *
 *   POST /api/screener { definition: ScreenDefinitionInput }
 *     → server-derived 13 governed members (certified producer)
 *     → ScreenDefinition.create (422 on invalid) → executeScreen → 200 {execution, result, vintage}
 *
 * The first-party read endpoint is directly accessible and does not consume identity credentials.
 *
 * GOVERNED MEMBERSHIP: the screened population is derived SERVER-SIDE from the v1.1.0
 * Replay Baseline + certified engine executions + governed golden identities. A request
 * carrying its own `members` is rejected (422) — client-supplied membership would void
 * the Governed property. A client-supplied `populationIdentity` must match the
 * server-derived identity exactly or the request is rejected (422).
 *
 * Determinism: identical definitions produce identical executionId/resultId (the producer
 * uses fixed clocks/seeded IDs; audit-only timestamp/requestId are omitted so responses
 * are byte-stable). No persistence, no new identity/tenant authority, no IPD dependency.
 */
import http from 'node:http';
import { TransportError } from '../transport-error';
import { resolveSectorEngine, baselineVintage } from '../executive-transport';
import { ScreenDefinition, ScreenDefinitionError } from '../../../iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition';
import { executeScreen, ScreenExecutionError } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import {
  produceScreenMembers,
  GOLDEN_BASELINE_IDENTITIES_BY_SECTOR,
  ScreenProducerError,
  type ScreenProducerRequest,
} from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import { CANONICAL_SCREEN_SECTORS } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenMemberInput';
import { compareMembers, populationIdentity } from '../../../iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation';
import type { CanonicalSector, PopulationMember } from '../../../iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation';


const MAX_BODY_BYTES = 1_000_000;

// Application projection is pure; the ordinary endpoint does not construct/store a capture.
import { projectExecution, type OriginalScreenReceipt, type PreparedScreen } from '../replay/ScreenEvaluationSnapshot';
export type { ExecutionMember as ScreenerExecutionMember } from '../replay/ScreenEvaluationSnapshot';

export interface ScreenerVintage {
  readonly asOf: string;
  readonly dataVersion: string;
  readonly mode: 'SNAPSHOT';
  readonly dataSource: string;
  readonly memberCount: number;
}

function readJson(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      chunks.push(c);
      if (chunks.reduce((n, b) => n + b.length, 0) > MAX_BODY_BYTES) reject(new TransportError(400, 'request-body-too-large'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown); }
      catch { reject(new TransportError(400, 'invalid-json')); }
    });
    req.on('error', (e) => reject(e));
  });
}

/**
 * Build the 13 governed producer requests: baseline sector + engine + frozen inputs from
 * the executive composition, caller-bound company identity from the governed GDS-07
 * golden table. Any unresolvable sector fails closed (governed population incomplete).
 */
export function buildGovernedProducerRequests(): readonly ScreenProducerRequest[] {
  return CANONICAL_SCREEN_SECTORS.map((sector) => {
    const resolved = resolveSectorEngine(sector);
    if (!resolved) throw new Error(`governed screener population incomplete: unresolvable sector ${sector}`);
    const companyId = GOLDEN_BASELINE_IDENTITIES_BY_SECTOR[sector as CanonicalSector];
    if (!companyId) throw new Error(`governed screener population incomplete: no golden identity for ${sector}`);
    return {
      sector: resolved.sector,
      engineId: resolved.engineId,
      companyId,
      referenceId: companyId,
      inputs: resolved.inputs as Record<string, unknown>,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Single original run receipt; the optional capture preflight runs BEFORE executeScreen. */
export function runGovernedScreen(definitionInput: unknown, beforeEvaluation?: (prepared: PreparedScreen) => void): OriginalScreenReceipt {
  if (!isRecord(definitionInput)) throw new TransportError(400, 'missing-definition');
  // Server-derived governed population (single production; engines execute exactly once).
  const produced = produceScreenMembers(buildGovernedProducerRequests());
  if (produced.length !== CANONICAL_SCREEN_SECTORS.length) {
    throw new Error('governed screener population incomplete');
  }
  // Verified population binding via the governed pipeline, consumed verbatim: G5
  // canonical ordering (`compareMembers`) then the G4 membership-only identity
  // (`populationIdentity`) over the validated canonical member set. This is exactly
  // the derivation `executeScreen` re-performs over admitted members for its exact
  // coverage check, so binding here cannot disagree with execution. Every member
  // passed VALID admission + GDS-07 identity validation inside the certified
  // producer; the transport hashes (sector, referenceId) pairs only and invents no
  // engine-output scores (the producer's `fromOutputs` path would require them).
  const canonical: PopulationMember[] = produced.map((m) => ({
    sector: m.provenance.sector as PopulationMember['sector'],
    referenceId: m.provenance.referenceId,
  }));
  const ordered = [...canonical].sort((a, b) => compareMembers(a, b));
  const verifiedIdentity = populationIdentity(ordered);
  const suppliedIdentity = definitionInput.populationIdentity;
  if (suppliedIdentity !== undefined && suppliedIdentity !== verifiedIdentity) {
    throw new TransportError(422, 'population-identity-mismatch');
  }
  const definition = ScreenDefinition.create(
    { ...definitionInput, populationIdentity: verifiedIdentity },
    { identity: verifiedIdentity },
  );
  const meta = baselineVintage();
  const vintage: ScreenerVintage = {
    asOf: meta.asOf,
    dataVersion: meta.dataVersion,
    mode: 'SNAPSHOT',
    dataSource: 'governed:program-v1.1-replay-baseline',
    memberCount: produced.length,
  };
  const prepared: PreparedScreen = {
    definition, memberInputs: produced.map(m => m.memberInput),
    memberProvenance: produced.map(m => m.provenance), vintage,
  };
  beforeEvaluation?.(prepared);
  const { execution, result } = executeScreen({ definition, members: prepared.memberInputs });
  return { ...prepared, execution, result };
}

/** Handle the credential-free POST /api/screener endpoint. */
export async function handleScreenerRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  try {
    if (req.url !== '/api/screener') { res.writeHead(404); res.end(JSON.stringify({ error: 'not found' })); return; }
    if (req.method !== 'POST') { res.writeHead(405); res.end(JSON.stringify({ error: 'method not allowed' })); return; }
    const body = await readJson(req);
    if (!isRecord(body)) throw new TransportError(400, 'request-body-must-be-object');
    // Governed membership: the client MUST NOT supply population authority.
    if ('members' in body) throw new TransportError(422, 'client-supplied-members-rejected');
    if (!isRecord(body.definition)) throw new TransportError(400, 'missing-definition');

    const receipt = runGovernedScreen(body.definition);
    const executionDto = projectExecution(receipt.execution);
    const { result, vintage } = receipt;
    res.writeHead(200);
    res.end(JSON.stringify({ execution: executionDto, result, vintage }));
  } catch (e) {
    if (e instanceof TransportError) { res.writeHead(e.status); res.end(JSON.stringify({ error: e.message })); return; }
    if (e instanceof ScreenDefinitionError || e instanceof ScreenExecutionError || e instanceof ScreenProducerError) {
      res.writeHead(422); res.end(JSON.stringify({ error: e.message, code: e.code })); return;
    }
    res.writeHead(500); res.end(JSON.stringify({ error: 'screener transport error', detail: String(e) }));
  }
}
