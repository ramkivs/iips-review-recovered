/** @vitest-environment node */
import { describe, it, expect, vi, afterEach } from 'vitest';
import http from 'node:http';
import { Socket, type AddressInfo } from 'node:net';
import { handleReplayRequest, isEvaluationPath, readCaptureBody } from './replay-transport';
import { GovernedScreenReplayService } from './GovernedScreenReplayService';
import { ScreenCaptureStore, LIMITS } from './ScreenEvaluationSnapshot';
import { runGovernedScreen } from '../screener/screener-transport';
const BASE = '/api/replay/evaluations';
const ID = '11111111-1111-4111-8111-111111111111';
const DEF = { definitionId: 'ROUTE-TEST', version: '1', predicates: [] };
const servers: http.Server[] = [];
async function server(service = new GovernedScreenReplayService(new ScreenCaptureStore())) {
  const runOriginal = vi.fn(runGovernedScreen);
  const app = http.createServer((req, res) => void handleReplayRequest(req, res, { service, runOriginal }));
  servers.push(app); await new Promise<void>(resolve => app.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
  const call = async (path: string, method = 'GET', body?: string) => {
    const res = await fetch(`${url}${path}`, { method, ...(body === undefined ? {} : { body }) });
    return { status: res.status, headers: res.headers, body: await res.json() as Record<string, unknown> };
  };
  return { service, runOriginal, call, url };
}
afterEach(async () => {
  vi.useRealTimers(); vi.restoreAllMocks();
  for (const app of servers.splice(0)) await new Promise<void>((resolve, reject) => app.close(error => error ? reject(error) : resolve()));
});

describe('bounded definition-only capture routes', () => {
  it('recognizes the reserved namespace before a legacy sector matcher', () => {
    for (const value of [BASE, `${BASE}/${ID}`, `${BASE}?x`, `${BASE}/x/replay`]) expect(isEvaluationPath(value)).toBe(true);
    for (const value of [undefined, '/api/replay/Banking', '/api/replay/evaluations-other']) expect(isEvaluationPath(value)).toBe(false);
  });
  it('captures 201 and inspects/replays in separate requests without evaluating on GET', async () => {
    const app = await server(); const captured = await app.call(BASE, 'POST', JSON.stringify({ definition: DEF }));
    expect(captured.status).toBe(201); expect(captured.headers.get('cache-control')).toBe('no-store');
    const original = captured.body.original as { snapshotId: string };
    const inspection = await app.call(`${BASE}/${original.snapshotId}`);
    expect(inspection.status).toBe(200); expect(inspection.body.original).toEqual(captured.body.original);
    expect(inspection.body.replay).toMatchObject({ state: 'NOT_PERFORMED' });
    expect((await app.call(`${BASE}/${original.snapshotId}/replay`, 'POST')).body.replay).toMatchObject({ state: 'COMPLETED_EQUIVALENT', comparisonScope: 'NP12RES-v01' });
    expect(app.runOriginal).toHaveBeenCalledTimes(1);
  });
  it('enforces methods, exact UUID/path forms and rejects replacement-context bodies', async () => {
    const app = await server();
    for (const [path, method, expected] of [[BASE, 'GET', 405], [`${BASE}/${ID}`, 'POST', 405], [`${BASE}/${ID}/replay`, 'GET', 405],
      [`${BASE}/Banking`, 'GET', 400], [`${BASE}/AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA`, 'GET', 400], [`${BASE}/${ID}/extra`, 'GET', 404],
      [`${BASE}/${ID}/`, 'GET', 404], [`${BASE}/${ID}?current=true`, 'GET', 404], [`${BASE}/`, 'POST', 404], [`${BASE}?x=1`, 'POST', 404]] as const) {
      expect((await app.call(path, method)).status, `${method} ${path}`).toBe(expected);
    }
    const body = await app.call(`${BASE}/${ID}/replay`, 'POST', JSON.stringify({ expectedResult: {} }));
    expect(body.status).toBe(400); expect(body.body.replay).toMatchObject({ state: 'NOT_PERFORMED', code: 'UNEXPECTED_REPLAY_BODY' });
    expect(app.runOriginal).not.toHaveBeenCalled();
  });
  it('refuses invalid JSON, missing definition, arbitrary context and >64 supplied predicates before production', async () => {
    const app = await server();
    const cases: Array<[unknown, number]> = [[{}, 400], [{ definition: DEF, members: [] }, 422], [{ definition: DEF, expectedResult: {} }, 400],
      [{ definition: DEF, evaluatorVersion: '02' }, 400], [{ definition: { ...DEF, memberInputs: [] } }, 400],
      [{ definition: { ...DEF, predicates: Array.from({ length: 65 }, () => ({ field: 'quality', operator: 'gte', operand: '0' })) } }, 422],
      [{ definition: { ...DEF, predicates: [{ field: 'quality', operator: 'gte', operand: 0 }] } }, 400]];
    for (const [body, status] of cases) expect((await app.call(BASE, 'POST', JSON.stringify(body))).status).toBe(status);
    expect((await app.call(BASE, 'POST', '{')).status).toBe(400);
    expect(app.runOriginal).not.toHaveBeenCalled();
    expect((await app.call(BASE, 'POST', JSON.stringify({ definition: { ...DEF, definitionId: 'x'.repeat(1025) } }))).status).toBe(422);
    expect(app.runOriginal).not.toHaveBeenCalled();
  });
  it('accepts exactly 64 supplied predicates and refuses excessive request bytes without truncation', async () => {
    const app = await server();
    const predicates = Array.from({ length: 64 }, () => ({ field: 'quality', operator: 'gte', operand: '0' }));
    expect((await app.call(BASE, 'POST', JSON.stringify({ definition: { ...DEF, predicates } }))).status).toBe(201);
    expect((await app.call(BASE, 'POST', ' '.repeat(LIMITS.bodyBytes + 1))).status).toBe(413);
    expect(app.runOriginal).toHaveBeenCalledTimes(1);
  });
  it('returns honest busy and full-capacity responses without queueing or producer invocation', async () => {
    const service = new GovernedScreenReplayService(new ScreenCaptureStore({ maxRecords: 1 })); const app = await server(service);
    const release = service.acquireOperation()!;
    const busy = await app.call(BASE, 'POST', JSON.stringify({ definition: DEF }));
    expect(busy.status).toBe(503); expect(busy.body).toMatchObject({ evaluationState: 'NOT_STARTED', captureState: 'NOT_RETAINED', code: 'REPLAY_BUSY' });
    expect(app.runOriginal).not.toHaveBeenCalled(); release();
    expect((await app.call(BASE, 'POST', JSON.stringify({ definition: DEF }))).status).toBe(201);
    const full = await app.call(BASE, 'POST', JSON.stringify({ definition: DEF }));
    expect(full.status).toBe(503); expect(full.body).toMatchObject({ evaluationState: 'NOT_STARTED', captureState: 'NOT_RETAINED', code: 'CAPTURE_CAPACITY_EXHAUSTED' });
    expect(app.runOriginal).toHaveBeenCalledTimes(1);
  });
});

describe('bounded body reader lifecycle', () => {
  function incoming(headers: http.IncomingHttpHeaders = {}) { const req = new http.IncomingMessage(new Socket()); req.headers = headers; return req; }
  function cleaned(req: http.IncomingMessage) { for (const event of ['data', 'end', 'aborted', 'error']) expect(req.listenerCount(event)).toBe(0); }
  it('clears listeners and body timer after a normal read', async () => {
    vi.useFakeTimers(); const req = incoming(); const promise = readCaptureBody(req);
    req.emit('data', Buffer.from('{"ok":true}')); req.emit('end');
    expect(await promise).toEqual({ ok: true }); cleaned(req); expect(vi.getTimerCount()).toBe(0);
  });
  it('refuses a declared or streamed body >16KB and releases all retained chunks', async () => {
    vi.useFakeTimers();
    const declared = incoming({ 'content-length': String(LIMITS.bodyBytes + 1) });
    await expect(readCaptureBody(declared)).rejects.toMatchObject({ status: 413 }); cleaned(declared);
    const streamed = incoming(); const promise = readCaptureBody(streamed); const failed = expect(promise).rejects.toMatchObject({ status: 413 });
    streamed.emit('data', Buffer.alloc(LIMITS.bodyBytes + 1)); await failed; cleaned(streamed); expect(vi.getTimerCount()).toBe(0);
  });
  it('times out partial bodies at 5 seconds, not indefinitely', async () => {
    vi.useFakeTimers(); const req = incoming(); const promise = readCaptureBody(req); const failed = expect(promise).rejects.toMatchObject({ status: 408, code: 'REQUEST_TIMEOUT' });
    req.emit('data', Buffer.from('{')); await vi.advanceTimersByTimeAsync(4_999); expect(req.listenerCount('end')).toBe(1);
    await vi.advanceTimersByTimeAsync(1); await failed; cleaned(req); expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['aborted', 'error'] as const)('releases the reader on %s without a lingering timer', async event => {
    vi.useFakeTimers(); const req = incoming(); const promise = readCaptureBody(req); const failed = expect(promise).rejects.toMatchObject({ status: 400 });
    req.emit(event, new Error('injected read failure')); await failed; cleaned(req); expect(vi.getTimerCount()).toBe(0);
  });
});

describe('transport acknowledgement and encoding failure honesty', () => {
  it('closes a failed delivery after commit without fabricating a NOT_STARTED / NOT_RETAINED response', async () => {
    const store = new ScreenCaptureStore(); const service = new GovernedScreenReplayService(store); const app = await server(service);
    vi.spyOn(http.ServerResponse.prototype, 'end').mockImplementationOnce(function () { throw new Error('injected acknowledgement delivery failure'); });
    await expect(app.call(BASE, 'POST', JSON.stringify({ definition: DEF }))).rejects.toThrow();
    expect(store.stats()).toMatchObject({ count: 1, reservations: 0 }); // genuinely committed, acknowledgement unconfirmed
    const release = service.acquireOperation(); expect(release).toBeTypeOf('function'); release?.();
  });
  it('accepts exactly 16KB and rejects invalid UTF-8 instead of silently replacing original definition text', async () => {
    const app = await server(); const body = JSON.stringify({ definition: DEF });
    expect((await app.call(BASE, 'POST', body + ' '.repeat(LIMITS.bodyBytes - Buffer.byteLength(body)))).status).toBe(201);
    const req = new http.IncomingMessage(new Socket()); const pending = readCaptureBody(req); const refused = expect(pending).rejects.toMatchObject({ status: 400, code: 'INVALID_JSON' });
    req.emit('data', Buffer.from([0x22, 0xc3, 0x28, 0x22])); req.emit('end'); await refused;
    expect(req.listenerCount('data')).toBe(0);
  });
});
