/** Bounded routes on the existing server, not a new service or persistence domain. */
import type http from 'node:http';
import { CAPTURE_UUID, LIMITS, CapturePolicyError, detachedFrozen, record, type OriginalRunner } from './ScreenEvaluationSnapshot';
import { GovernedScreenReplayService, wireReply, type WireReply } from './GovernedScreenReplayService';

const BASE = '/api/replay/evaluations';
export function isEvaluationPath(url: string | undefined): boolean {
  return url === BASE || url?.startsWith(`${BASE}/`) === true || url?.startsWith(`${BASE}?`) === true;
}
export interface ReplayRouteDependencies { readonly service: GovernedScreenReplayService; readonly runOriginal: OriginalRunner }
function refusal(status: number, code: string, diagnostic: string, capture: boolean): WireReply {
  return wireReply(status, capture
    ? { captureState: 'NOT_RETAINED', evaluationState: 'NOT_STARTED', phase: 'REQUEST', code, diagnostic }
    : { replay: { state: 'NOT_PERFORMED', code, diagnostic } });
}

/** Stops retaining chunks immediately on refusal; all timers/listeners are cleaned up. */
export function readCaptureBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    let chunks: Buffer[] = [];
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      req.off('data', onData); req.off('end', onEnd); req.off('aborted', onAbort); req.off('error', onError);
      chunks = [];
    };
    const fail = (error: CapturePolicyError) => {
      if (settled) return;
      settled = true; cleanup(); req.resume(); reject(error);
    };
    const onData = (chunk: Buffer) => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > LIMITS.bodyBytes) { fail(new CapturePolicyError(413, 'REQUEST_TOO_LARGE', 'Capture request exceeds 16,384 bytes.')); return; }
      chunks.push(chunk);
    };
    const onEnd = () => {
      if (settled) return;
      const rawBytes = Buffer.concat(chunks);
      settled = true; cleanup();
      try { resolve(JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(rawBytes)) as unknown); }
      catch { reject(new CapturePolicyError(400, 'INVALID_JSON', 'Capture request must be valid JSON.')); }
    };
    const onAbort = () => fail(new CapturePolicyError(400, 'REQUEST_ABORTED', 'Capture request was aborted before evaluation.'));
    const onError = () => fail(new CapturePolicyError(400, 'REQUEST_BODY_ERROR', 'Capture request could not be read.'));
    const timer = setTimeout(() => fail(new CapturePolicyError(408, 'REQUEST_TIMEOUT', 'Capture body did not complete within five seconds.')), LIMITS.bodyDeadlineMs);
    timer.unref?.();
    req.on('data', onData); req.once('end', onEnd); req.once('aborted', onAbort); req.once('error', onError);
    const declared = req.headers['content-length'];
    if (declared !== undefined && (!/^\d+$/.test(declared) || Number(declared) > LIMITS.bodyBytes)) {
      fail(new CapturePolicyError(413, 'REQUEST_TOO_LARGE', 'Capture request exceeds 16,384 bytes.'));
    }
  });
}
function captureDefinition(body: unknown): Record<string, unknown> {
  if (!record(body) || !record(body.definition)) throw new CapturePolicyError(400, 'MISSING_DEFINITION', 'A definition-only request is required.');
  if ('members' in body) throw new CapturePolicyError(422, 'CLIENT_MEMBERS_REJECTED', 'Membership is governed server-side.');
  if (Object.keys(body).some(k => k !== 'definition')) throw new CapturePolicyError(400, 'UNEXPECTED_CAPTURE_FIELD', 'Client context, expected results and evaluator overrides are not accepted.');
  const d = body.definition;
  const keys = ['definitionId', 'version', 'populationIdentity', 'predicates'];
  if (Object.keys(d).some(k => !keys.includes(k)) || typeof d.definitionId !== 'string' || typeof d.version !== 'string' || !Array.isArray(d.predicates)) {
    throw new CapturePolicyError(400, 'INVALID_CAPTURE_DEFINITION', 'A definition ID, version and predicate array are required.');
  }
  if (d.predicates.length > LIMITS.predicates) throw new CapturePolicyError(422, 'CAPTURE_PREDICATE_LIMIT', 'At most 64 supplied predicates are accepted before canonical deduplication.');
  for (const p of d.predicates) {
    if (!record(p) || Object.keys(p).length !== 3 || ['field', 'operator', 'operand'].some(k => typeof p[k] !== 'string')) {
      throw new CapturePolicyError(400, 'INVALID_CAPTURE_PREDICATE', 'Each predicate requires field, operator and decimal-text operand.');
    }
  }
  return detachedFrozen(d);
}

export async function handleReplayRequest(req: http.IncomingMessage, res: http.ServerResponse, deps: ReplayRouteDependencies): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  const url = req.url ?? '';
  const capture = url === BASE;
  let responseTimer: ReturnType<typeof setTimeout> | undefined;
  const send = (reply: WireReply) => {
    if (res.destroyed || res.writableEnded) return;
    if (res.headersSent) { res.destroy(); return; }
    responseTimer = setTimeout(() => res.destroy(), LIMITS.responseDeadlineMs);
    responseTimer.unref?.();
    res.once('finish', () => clearTimeout(responseTimer));
    res.once('close', () => clearTimeout(responseTimer));
    if (reply.status >= 400) { res.shouldKeepAlive = false; res.setHeader('Connection', 'close'); req.resume(); }
    res.writeHead(reply.status); res.end(reply.json);
  };
  const match = /^\/api\/replay\/evaluations\/([^/?]+)(\/replay)?$/.exec(url);
  if (!capture && !match) { send(refusal(404, 'REPLAY_ROUTE_NOT_FOUND', 'Evaluation route not found.', false)); return; }
  const action = capture ? 'capture' : match?.[2] ? 'replay' : 'read';
  if (req.method !== (action === 'read' ? 'GET' : 'POST')) {
    res.setHeader('Allow', action === 'read' ? 'GET' : 'POST');
    send(refusal(405, 'METHOD_NOT_ALLOWED', 'Method not allowed for this evaluation route.', capture)); return;
  }
  const id = match?.[1];
  if (!capture && (!id || !CAPTURE_UUID.test(id))) { send(refusal(400, 'INVALID_CAPTURE_ID', 'An exact capture-occurrence UUID is required.', false)); return; }
  if (!capture && (req.headers['transfer-encoding'] !== undefined || Number(req.headers['content-length'] ?? 0) !== 0)) {
    send(refusal(400, 'UNEXPECTED_REPLAY_BODY', 'Read/replay accepts no replacement context or expected result body.', false)); return;
  }
  const release = deps.service.acquireOperation();
  if (!release) { send(refusal(503, 'REPLAY_BUSY', 'Another capture/read/replay operation is active in this process; no operation was queued.', capture)); return; }
  let aborted = false;
  const abort = () => { aborted = true; };
  const close = () => { if (!res.writableFinished) aborted = true; release(); req.off('aborted', abort); };
  req.once('aborted', abort); res.once('finish', close); res.once('close', close);
  let reply: WireReply;
  try {
    if (capture) {
      const definition = captureDefinition(await readCaptureBody(req));
      reply = deps.service.capture(definition, deps.runOriginal, () => aborted);
    } else if (action === 'read') reply = deps.service.inspect(id!);
    else reply = deps.service.replay(id!);
  } catch (error) {
    reply = refusal(error instanceof CapturePolicyError ? error.status : 500,
      error instanceof CapturePolicyError ? error.code : 'REPLAY_TRANSPORT_FAILED',
      error instanceof CapturePolicyError ? error.message : 'The evaluation operation could not be completed.', capture);
  }
  // A committed original (or performed replay) must never become a fabricated NOT_STARTED
  // response when acknowledgement delivery fails. Close the connection: the client is unconfirmed.
  try { send(reply); } catch { res.destroy(); }
}
