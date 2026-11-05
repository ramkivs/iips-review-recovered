/** U1 AMEND-02 evidence-only writer. One OS writer per directory is an operational precondition. */
import type http from 'node:http';
import { readJsonBody, sendJson } from '../owner-scoped-http.js';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import { ownerContextFromBinding, readBindingPrecondition } from '../user-portfolio/ownerContextFromBinding.js';
import { evaluateRequestFirstPartySignal, isFirstPartyHardeningSatisfied } from '../user-portfolio/firstPartySignal.js';
import { resolveDataDir } from '../persistence/persistence-service.js';
import { validatePortfolioIdParam } from './brokerImportBoundary.js';
import { resolveBrokerEvidenceOwnerContext } from './brokerImportEvidenceOwnerResolver.js';
import { BrokerImportEvidenceStore, BrokerImportEvidenceError, buildBrokerImportEvidence, type BrokerImportEvidenceRecord } from './brokerImportEvidenceStore.js';
import { EVIDENCE_BODY_LIMIT, validateEvidenceSubmission } from '../../src/api/brokerEvidenceSubmission.js';

/** Consumer seam for fault injection; no change to PF-1 or A-9's read-only dependency. */
export interface EvidenceSubmissionDeps {
  readonly env?: NodeJS.ProcessEnv;
  readonly evidenceStoreFactory?: (dataDir: string) => Pick<BrokerImportEvidenceStore, 'readByImportId' | 'retain'>;
}
// A process-wide queue, NOT a cross-process lock. Fresh index construction happens INSIDE it.
let writer: Promise<unknown> = Promise.resolve();
function serialized<T>(work: () => T): Promise<T> {
  const next = writer.then(work);
  writer = next.catch(() => undefined);
  return next;
}
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
}
export function stableEvidence(record: BrokerImportEvidenceRecord): string {
  const { recordDigest: _digest, ...rest } = record;
  return canonical({ ...rest, rows: rest.rows.map(({ quarantineIds: _ids, ...row }) => row) });
}

export async function handleEvidenceSubmission(req: http.IncomingMessage, res: http.ServerResponse, portfolioId: string, deps: EvidenceSubmissionDeps): Promise<void> {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); sendJson(res, 405, { error: 'method-not-allowed' }); return; }
  const host = typeof req.headers.host === 'string' ? req.headers.host : null;
  if (!isFirstPartyHardeningSatisfied(evaluateRequestFirstPartySignal(req.headers, 'POST', host))) {
    sendJson(res, 403, { error: 'cross-site-request-refused' }); return;
  }
  const env = deps.env ?? process.env;
  const binding = ownerContextFromBinding(readBindingPrecondition(env), env);
  if (binding.state !== 'IPD_BINDING_RESOLVED' || !binding.established) { respondOwnerContextUnavailable(res); return; }
  if ((req.url ?? '').includes('?') || validatePortfolioIdParam(portfolioId) !== null) {
    sendJson(res, 400, { error: 'invalid-request' }); return;
  }
  const owner = resolveBrokerEvidenceOwnerContext(env);
  if (!owner) { respondOwnerContextUnavailable(res); return; }
  const body = await readJsonBody(req, EVIDENCE_BODY_LIMIT);
  if (!body.ok) { sendJson(res, body.status, { error: body.error }); return; }
  if (!validateEvidenceSubmission(body.value)) { sendJson(res, 400, { error: 'invalid-evidence-submission' }); return; }
  const dto = body.value;
  try {
    const result = await serialized(() => {
      const dataDir = resolveDataDir(env);
      const store = () => deps.evidenceStoreFactory?.(dataDir) ?? new BrokerImportEvidenceStore({ dataDir });
      const candidate = buildBrokerImportEvidence({ ...owner, portfolioSlot: portfolioId, fileName: dto.fileName, preview: dto.preview });
      const journal = store();
      const previous = journal.readByImportId(owner.tenantId, owner.ownerUserId, candidate.importId);
      if (previous && stableEvidence(previous) !== stableEvidence(candidate)) return null;
      const retained = journal.retain(candidate);
      // A fresh instance rebuilds from disk, not the writer's cached in-memory index.
      const read = store().readByImportId(owner.tenantId, owner.ownerUserId, candidate.importId);
      if (!read || read.recordDigest !== retained.record.recordDigest || stableEvidence(read) !== stableEvidence(candidate)) throw new Error('read-back failed');
      return { read, duplicate: retained.duplicate };
    });
    if (!result) { sendJson(res, 409, { outcome: 'EVIDENCE_CONFLICT' }); return; }
    sendJson(res, result.duplicate ? 200 : 201, {
      outcome: 'EVIDENCE_RETAINED', importId: result.read.importId, recordDigest: result.read.recordDigest,
      duplicate: result.duplicate, retrievalPath: `/api/broker-import/${encodeURIComponent(portfolioId)}/evidence/${result.read.importId}`,
      provenance: 'BROWSER_PIPELINE_SNAPSHOT', holdingsSaved: false,
    });
  } catch (error) {
    sendJson(res, 503, { outcome: error instanceof BrokerImportEvidenceError && error.code === 'EVIDENCE_TAMPERED' ? 'EVIDENCE_TAMPERED' : 'EVIDENCE_UNAVAILABLE' });
  }
}
