/**
 * Step 9 operator targeted tests — isolated contract double + real IRR Route A.
 * No live runtime, IPD database, historical fixture, or acceptance evidence is used.
 * @vitest-environment node
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { handleBrokerImportRequest } from './brokerImportHttp.js';
import {
  fileStep9EvidenceStore,
  parseStep9Args,
  runStep9Operator,
  STEP9_EVIDENCE_SCHEMA,
  STEP9_FIXTURE_NAME,
  type Step9Deps,
  type Step9Evidence,
  type Step9EvidenceStore,
} from './step9AcceptanceFixtureOperator.js';
import { findRefusedWireKeys, IpcClientError, type IpcCallResult, type IpcOperation } from '../user-portfolio/ipcClient.js';
import { buildV1SavePayload } from './brokerImportV1SaveAdapter.js';
import { BROKER_IMPORT_SYMBOL_PATTERN, validateBrokerImportSaveDto } from './brokerImportBoundary.js';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type Row = Record<string, unknown>;
const NOW = '2026-11-08T19:45:00.000Z';
const TOKEN = '0123456789abcdef0123456789abcdef';
const FIXTURE_ID = `step9-fixture-20261108T194500Z-${TOKEN}`;
const SYMBOL = `S9FIX${TOKEN.toUpperCase()}`;
const clone = <T>(value: T): T => structuredClone(value);
const ok = (op: IpcOperation, result: unknown, requestId?: string): IpcCallResult => ({ kind: 'SUCCESS', frame: { v: 1, ok: true, op, requestId, result }, bytesReceived: 100 });
const refused = (op: IpcOperation, outcome: string, requestId?: string): IpcCallResult => ({ kind: 'CLASS_A', frame: { v: 1, ok: false, op, requestId, outcome }, bytesReceived: 60 } as IpcCallResult);
const classP = (): IpcCallResult => ({ kind: 'CLASS_P', bytesReceived: 0, reason: null });
const unknown = (op: IpcOperation): IpcCallResult => ({ kind: 'OUTCOME_UNKNOWN', reason: 'TIMEOUT', op, write: op === 'portfolio.create' || op === 'portfolio.delete', retried: false });
function correlate(result: IpcCallResult, requestId?: string): IpcCallResult {
  if (result.kind === 'SUCCESS' && result.frame.requestId === undefined) return { ...result, frame: { ...result.frame, requestId } };
  if (result.kind === 'CLASS_A' && result.frame.requestId === undefined) return { ...result, frame: { ...result.frame, requestId } };
  return result;
}
const summary = (id: string): Row => ({ portfolioId: id, portfolioName: 'Unrelated personal portfolio', revision: 3, holdingsCount: 1, totalMarketValue: 10, lastUpdated: NOW, weightSumPercentage: 100, provenanceDigest: 'a'.repeat(64), isSaved: true });

class MemoryEvidence implements Step9EvidenceStore {
  readonly files = new Map<string, unknown>();
  updates = 0;
  failUpdateAt: number | null = null;
  create(path: string, record: Step9Evidence): void {
    if (this.files.has(path)) throw new Error('exists');
    this.files.set(path, clone(record));
  }
  read(path: string): unknown {
    if (!this.files.has(path)) throw new Error('missing');
    return clone(this.files.get(path));
  }
  update(path: string, record: Step9Evidence): void {
    this.updates += 1;
    if (this.failUpdateAt === this.updates) throw new Error('injected journal fault');
    if (!this.files.has(path)) throw new Error('missing');
    this.files.set(path, clone(record));
  }
}

/** Contract-v1 stateful double. Tombstones remain in the map: no physical erasure. */
class IpdDouble {
  readonly calls: Array<{ op: IpcOperation; payload: Row; requestId?: string }> = [];
  readonly rows = new Map<string, { detail: Row; revisions: Row[]; status: 'ACTIVE' | 'TOMBSTONED' }>();
  binding: 'ACTIVE' | 'ABSENT' | 'AMBIGUOUS' = 'ACTIVE';
  personalUse = true;
  conflictBehavior: 'CONFLICT' | 'COMMIT' | 'MUTATE_AND_CONFLICT' = 'CONFLICT';
  next: { op: IpcOperation; result: IpcCallResult; apply: boolean; after?: () => void } | null = null;
  constructor() { this.rows.set('REAL-PORTFOLIO', { detail: { ...summary('REAL-PORTFOLIO'), holdings: [], contributions: [] }, revisions: [], status: 'ACTIVE' }); }
  readonly call = async (op: IpcOperation, payload: Row = {}, options: { requestId?: string } = {}): Promise<IpcCallResult> => {
    this.calls.push({ op, payload: clone(payload), requestId: options.requestId });
    const write = ['portfolio.create', 'portfolio.save', 'portfolio.reset', 'portfolio.delete'].includes(op);
    if (this.binding !== 'ACTIVE') return classP();
    if (write && !this.personalUse) return refused(op, 'WRITE_NOT_AUTHORIZED', options.requestId);
    const fault = this.next?.op === op ? this.next : null;
    if (fault) this.next = null;
    if (fault && !fault.apply) { fault.after?.(); return correlate(fault.result, options.requestId); }
    const result = this.execute(op, payload, options.requestId);
    if (fault) { fault.after?.(); return correlate(fault.result, options.requestId); }
    return result;
  };
  private execute(op: IpcOperation, payload: Row, requestId?: string): IpcCallResult {
    const id = String(payload.portfolioId ?? '');
    if (op === 'portfolio.list') return ok(op, [...this.rows.values()].filter((row) => row.status === 'ACTIVE').map((row) => {
      const { holdings: _holdings, contributions: _contributions, ...base } = row.detail;
      return base;
    }), requestId);
    const row = this.rows.get(id);
    if (op === 'portfolio.get' || op === 'portfolio.revisions') {
      if (!row || row.status !== 'ACTIVE') return refused(op, 'RESOURCE_UNAVAILABLE', requestId);
      return ok(op, op === 'portfolio.get' ? row.detail : row.revisions, requestId);
    }
    if (op === 'portfolio.create') {
      if (this.rows.has(id)) return refused(op, 'INVALID_REQUEST', requestId);
      const holding = (payload.holdings as Row[])[0];
      const detail: Row = { portfolioId: id, portfolioName: payload.portfolioName, revision: 1, holdingsCount: 1, totalMarketValue: 1, lastUpdated: NOW, weightSumPercentage: 100, provenanceDigest: 'b'.repeat(64), isSaved: false,
        holdings: [{ symbol: holding.symbol, companyId: `MANUAL:${String(holding.symbol)}`, quantity: 1, averageBuyPrice: 1, currentPrice: 1, marketValue: 1, weightPercentage: 100, active: true, sourceBroker: 'manual-personal', lineageDigest: 'c'.repeat(64), identityStatus: 'UNRESOLVED', resolutionDisposition: 'MANUAL_PERSONAL_ENTRY', securityIdentity: null }], contributions: [] };
      const revisions = [{ revision: 1, operation: 'INITIAL', committedAt: NOW, totalMarketValue: 1, provenanceDigest: 'b'.repeat(64), holdingsCount: 1 }];
      this.rows.set(id, { detail, revisions, status: 'ACTIVE' });
      return ok(op, { disposition: 'SAVED_NEW_BATCH', revision: 1, isDuplicate: false, holdingsSavedCount: 1, totalMarketValue: 1, weightSumPercentage: 100, savedAt: NOW, provenanceDigest: 'b'.repeat(64), portfolio: detail }, requestId);
    }
    if (!row || row.status !== 'ACTIVE') return refused(op, 'RESOURCE_UNAVAILABLE', requestId);
    if (op === 'portfolio.save') {
      const stale = payload.expectedRevision !== row.detail.revision;
      if (!stale || this.conflictBehavior !== 'CONFLICT') {
        row.detail = { ...row.detail, revision: Number(row.detail.revision) + 1, isSaved: true, holdings: (row.detail.holdings as Row[]).map((holding) => ({ ...holding, quantity: 2, marketValue: 2 })) };
        row.revisions = [...row.revisions, { revision: row.detail.revision, operation: 'MERGE', committedAt: NOW, totalMarketValue: 2, provenanceDigest: 'd'.repeat(64), holdingsCount: 1 }];
      }
      if (stale && this.conflictBehavior !== 'COMMIT') return refused(op, 'REVISION_CONFLICT', requestId);
      return ok(op, { disposition: 'MERGED_INTO_EXISTING', revision: row.detail.revision, durability: 'DURABLE', durable: true }, requestId);
    }
    if (op === 'portfolio.delete') {
      if (payload.expectedRevision !== row.detail.revision) return refused(op, 'REVISION_CONFLICT', requestId);
      row.status = 'TOMBSTONED';
      row.revisions = [...row.revisions, { revision: Number(row.detail.revision) + 1, operation: 'DELETE', committedAt: NOW, totalMarketValue: 0, provenanceDigest: `tombstone:${id}`, holdingsCount: 0 }];
      return ok(op, { portfolioId: id, deletedAt: NOW }, requestId);
    }
    return refused(op, 'INVALID_REQUEST', requestId);
  }
}

const closers: Array<() => Promise<void>> = [];
const tempDirs: string[] = [];
afterEach(async () => {
  while (closers.length) await closers.pop()!();
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});
let sequence = 0;
async function harness(options: { readonly admitIdentityQualification?: boolean } = {}) {
  const ipd = new IpdDouble();
  const evidence = new MemoryEvidence();
  const server = http.createServer((req, res) => {
    void handleBrokerImportRequest(req, res, {
      env: env(),
      saveAdapterDeps: { callIpc: ipd.call },
      // These tests exercise the operator's F1–F7 lifecycle against a stand-in IPD, so the
      // identity-qualification gate is admitted here and the write reaches the fake store.
      // The gate's own refusal is tested separately, below.
      ...(options.admitIdentityQualification === false
        ? {}
        : { identityQualification: () => ({ admitted: true as const }) }),
    });
  });
  await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  closers.push(() => new Promise<void>((resolveClose) => { server.close(() => resolveClose()); server.closeAllConnections(); }));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const path = `/tmp/step9-operator-test-${++sequence}.json`;
  const deps: Step9Deps = {
    env: env(), platform: 'linux', nodeVersion: '22.22.3', callIpc: ipd.call, evidence,
    now: () => new Date(NOW),
    uuid: () => '01234567-89ab-cdef-0123-456789abcdef',
  };
  const config = { mode: 'execute' as const, irrOrigin: origin, evidencePath: path };
  return { ipd, evidence, deps, config, origin, path };
}
function env(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return { IIPS_LOCAL_PERSONAL_USE: '1', IIPS_G3_IPC_BINDING_PROVISIONED: 'true', IIPS_G2_IPC_ENDPOINT: '/tmp/iips-step9-operator-test.sock', NODE_ENV: 'test', ...overrides };
}
const writes = (ipd: IpdDouble) => ipd.calls.filter((call) => ['portfolio.create', 'portfolio.delete', 'portfolio.save', 'portfolio.reset'].includes(call.op));
const ops = (ipd: IpdDouble, op: IpcOperation) => ipd.calls.filter((call) => call.op === op);

describe('Step 9 operator — CLI and F1 runtime', () => {
  it('no arguments is help-only; exact modes and closed arguments are required', () => {
    expect(parseStep9Args([])).toBeNull();
    expect(parseStep9Args(['--preflight', '--irr-origin', 'http://127.0.0.1:8787', '--evidence', '/tmp/run.json'])).toEqual({ mode: 'preflight', irrOrigin: 'http://127.0.0.1:8787', evidencePath: '/tmp/run.json' });
    for (const args of [['--execute-acceptance'], ['--preflight', '--execute-acceptance', '--irr-origin', 'x', '--evidence', 'y'], ['--preflight', '--irr-origin', 'x', '--evidence', 'y', '--owner', 'z'], ['--preflight', '--irr-origin', 'x', '--evidence', '']]) expect(() => parseStep9Args(args)).toThrow();
  });
  it.each([
    { IIPS_LOCAL_PERSONAL_USE: undefined }, { IIPS_LOCAL_PERSONAL_USE: '0' }, { IIPS_LOCAL_PERSONAL_USE: 'true' },
    { IIPS_G3_IPC_BINDING_PROVISIONED: undefined }, { IIPS_G2_IPC_ENDPOINT: undefined },
    { IIPS_G2_IPC_ENDPOINT: 'https://example.test/socket' }, { IIPS_G2_IPC_ENDPOINT: 'relative.sock' }, { NODE_ENV: 'production' },
  ])('refuses invalid local runtime before any I/O: %j', async (overrides) => {
    const h = await harness();
    const result = await runStep9Operator(h.config, { ...h.deps, env: env(overrides) });
    expect(result.status).toBe('STOPPED');
    expect(result.phases.F1).toBe('BLOCKED');
    expect(h.ipd.calls).toHaveLength(0);
    expect(h.evidence.files.size).toBe(0);
  });
  it.each(['http://example.test:8787', 'https://127.0.0.1:8787', 'http://127.0.0.1:8787/path', 'http://user@127.0.0.1:8787', 'http://127.0.0.1:8787/?x=1'])('refuses non-loopback or non-origin IRR target %s', async (irrOrigin) => {
    const h = await harness();
    const result = await runStep9Operator({ ...h.config, irrOrigin }, h.deps);
    expect(result.failure?.code).toBe('RUNTIME_IRR_ORIGIN_NOT_LOOPBACK');
    expect(h.ipd.calls).toHaveLength(0);
  });
  it('refuses unsupported Node/platform without treating enablement as authorization', async () => {
    const h = await harness();
    for (const deps of [{ nodeVersion: '22.12.0' }, { nodeVersion: '20.0.0' }, { platform: 'aix' as NodeJS.Platform }]) {
      const result = await runStep9Operator(h.config, { ...h.deps, ...deps });
      expect(result.status).toBe('STOPPED');
      expect(result.runtime).toBeUndefined();
    }
    expect(h.ipd.calls).toHaveLength(0);
  });
});

describe('Step 9 operator — F2 binding and preflight fail closed', () => {
  it.each(['ABSENT', 'AMBIGUOUS'] as const)('Class P for %s binding is unverifiable and sends no write', async (binding) => {
    const h = await harness(); h.ipd.binding = binding;
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure).toEqual({ phase: 'F2', code: 'IPC_BINDING_OR_PROTOCOL_UNVERIFIABLE' });
    expect(writes(h.ipd)).toHaveLength(0);
  });
  it('empty portfolio.list is authoritative binding-resolution evidence, not an absent binding', async () => {
    const h = await harness(); h.ipd.rows.clear();
    const result = await runStep9Operator({ ...h.config, mode: 'preflight' }, h.deps);
    expect(result.status).toBe('PREFLIGHT_COMPLETE');
    expect(result.phases.F2).toBe('PASS');
    expect(result.step9).toBe('NOT PASSED');
    expect(writes(h.ipd)).toHaveLength(0);
    expect(result.http).toHaveLength(1);
    expect(result.http[0].method).toBe('GET');
  });
  it.each([
    { result: ok('portfolio.list', {}), code: 'IPC_LIST_PROTOCOL_UNVERIFIABLE' },
    { result: ok('portfolio.list', [summary('x'), summary('x')]), code: 'IPC_LIST_PROTOCOL_UNVERIFIABLE' },
    { result: ok('portfolio.get', []), code: 'IPC_PROTOCOL_UNVERIFIABLE' },
    { result: unknown('portfolio.list'), code: 'IPC_OUTCOME_UNKNOWN_TIMEOUT' },
  ])('malformed/uncertain protocol stops before mutation: %j', async ({ result, code }) => {
    const h = await harness(); h.ipd.next = { op: 'portfolio.list', result, apply: false };
    const run = await runStep9Operator(h.config, h.deps);
    expect(run.failure?.code).toBe(code);
    expect(writes(h.ipd)).toHaveLength(0);
  });
  it('correlates requestId and refuses a mismatched success frame', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.list', result: ok('portfolio.list', [], 'wrong-correlation'), apply: false };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe('IPC_PROTOCOL_UNVERIFIABLE');
    expect(writes(h.ipd)).toHaveLength(0);
  });
  it('local client refusal and pre-existing target both stop without fallback identity or cleanup', async () => {
    const h = await harness();
    const local = await runStep9Operator(h.config, { ...h.deps, callIpc: async () => { throw new IpcClientError('ENDPOINT_NOT_CONFIGURED', 'test'); } });
    expect(local.failure?.code).toBe('IPC_LOCAL_REFUSAL');
    h.ipd.rows.set(FIXTURE_ID, { detail: { ...summary(FIXTURE_ID), portfolioName: STEP9_FIXTURE_NAME, holdings: [], contributions: [] }, revisions: [], status: 'ACTIVE' });
    const collision = await runStep9Operator({ ...h.config, evidencePath: `${h.path}-collision` }, h.deps);
    expect(collision.failure?.code).toBe('FIXTURE_ID_ALREADY_EXISTS');
    expect(writes(h.ipd)).toHaveLength(0);
  });
  it('never transmits owner/tenant/authority fields or selects the unrelated portfolio', async () => {
    const h = await harness();
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('CONFLICT_OBSERVED');
    for (const call of h.ipd.calls) expect(findRefusedWireKeys(call.payload)).toEqual([]);
    expect(ops(h.ipd, 'portfolio.delete').map((call) => call.payload.portfolioId)).toEqual([FIXTURE_ID]);
    expect(h.ipd.rows.get('REAL-PORTFOLIO')?.status).toBe('ACTIVE');
  });
});

describe('Step 9 operator — F1–F7 isolated lifecycle', () => {
  it('captures the exact Route A 409, unchanged authoritative state, and tombstone semantics', async () => {
    const h = await harness();
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('CONFLICT_OBSERVED');
    expect(result.phases).toEqual({ F1: 'PASS', F2: 'PASS', F3: 'PASS', F4: 'PASS', F5: 'PASS', F6: 'PASS', F7: 'PASS' });
    expect(result.step9).toBe('NOT PASSED');
    const post = result.http.find((capture) => capture.method === 'POST')!;
    expect(post.url).toBe(`${h.origin}/api/broker-import/${FIXTURE_ID}/holdings`);
    expect(JSON.parse(post.requestBody!)).toEqual({ expectedRevision: 0, mode: 'MERGE', holdings: [{ symbol: SYMBOL, quantity: 2, averageBuyPrice: 1, currentPrice: 1 }] });
    expect(post.status).toBe(409);
    expect(post.responseBody).toBe('{"outcome":"REVISION_CONFLICT"}');
    expect(result.fixture?.initialDetail?.revision).toBe(1);
    expect(result.fixture?.initialRevisions).toEqual([{ revision: 1, operation: 'INITIAL', committedAt: NOW, totalMarketValue: 1, provenanceDigest: 'b'.repeat(64), holdingsCount: 1 }]);
    expect(ops(h.ipd, 'portfolio.create')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')[0].payload).toEqual({ portfolioId: FIXTURE_ID, expectedRevision: 1 });
    expect(ops(h.ipd, 'portfolio.reset')).toHaveLength(0);
    const tombstone = h.ipd.rows.get(FIXTURE_ID)!;
    expect(tombstone.status).toBe('TOMBSTONED');
    expect(tombstone.revisions[tombstone.revisions.length - 1]?.operation).toBe('DELETE');
    expect(result.recovery).toEqual({ disposition: 'LOGICAL_REMOVAL_VERIFIED', physicalErasure: false });
    expect(result.http[result.http.length - 1]?.status).toBe(404);
  });
  it('IPD enablement/W-1 refusal is authoritative: no bypass, second write, or cleanup delete', async () => {
    const h = await harness(); h.ipd.personalUse = false;
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe('CREATE_WRITE_NOT_AUTHORIZED');
    expect(result.status).toBe('STOPPED');
    expect(writes(h.ipd).map((call) => call.op)).toEqual(['portfolio.create']);
    expect(h.ipd.rows.has(FIXTURE_ID)).toBe(false);
    expect(result.http.every((capture) => capture.method === 'GET')).toBe(true);
  });
  it.each(['INVALID_REQUEST', 'REVISION_CONFLICT', 'UNAVAILABLE'])('create Class A %s stops without speculative cleanup', async (outcome) => {
    const h = await harness(); h.ipd.next = { op: 'portfolio.create', result: refused('portfolio.create', outcome), apply: false };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe(`CREATE_${outcome}`);
    expect(writes(h.ipd).map((call) => call.op)).toEqual(['portfolio.create']);
  });
  it('a post-commit create projection UNAVAILABLE is reconciled rather than abandoned', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.create', result: refused('portfolio.create', 'UNAVAILABLE'), apply: true };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe('CREATE_UNAVAILABLE');
    expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
    expect(ops(h.ipd, 'portfolio.create')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
  });

  it('preserves Stage 1 REPLACE/MERGE and Stage 2 symbol grammar safeguards', () => {
    const base = { expectedRevision: 0, mode: 'MERGE' as const, holdings: [{ symbol: 'M&M', quantity: 1, averageBuyPrice: 1, currentPrice: 1 }] };
    expect(buildV1SavePayload('p', { ...base, mode: 'REPLACE' }).operation).toBe('REPLACE');
    expect(buildV1SavePayload('p', base)).not.toHaveProperty('operation');
    for (const symbol of ['RELIANCE', '3MINDIA', 'M&M', 'BAJAJ-AUTO', 'A_B', 'DR.REDDY', 'A'.repeat(40)]) expect(BROKER_IMPORT_SYMBOL_PATTERN.test(symbol)).toBe(true);
    for (const symbol of ['A B', '-A', '.A', '_A', '&A', 'A/B', 'A'.repeat(41), 'É', '😀']) {
      const result = validateBrokerImportSaveDto({ ...base, holdings: [{ ...base.holdings[0], symbol }] });
      expect(result.ok).toBe(false);
    }
  });
});

describe('Step 9 operator — partial creation and verification recovery', () => {
  it('create timeout after commit reconciles read-only then deletes the exact fixture once', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.create', result: unknown('portfolio.create'), apply: true };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('STOPPED');
    expect(result.failure?.code).toBe('IPC_OUTCOME_UNKNOWN_TIMEOUT');
    expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
    expect(ops(h.ipd, 'portfolio.create')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
    expect(h.ipd.rows.get(FIXTURE_ID)?.status).toBe('TOMBSTONED');
  });
  it('create timeout without commit never issues an unauthorized delete', async () => {
    const h = await harness(); h.ipd.next = { op: 'portfolio.create', result: unknown('portfolio.create'), apply: false };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('STOPPED');
    expect(result.recovery?.disposition).toBe('NO_FIXTURE_OBSERVED');
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(0);
  });
  it('ambiguous binding during unknown-create reconciliation blocks cleanup', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.create', result: unknown('portfolio.create'), apply: true, after: () => { h.ipd.binding = 'AMBIGUOUS'; } };
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('RECOVERY_REQUIRED');
    expect(result.failure?.code).toContain('CLEANUP_IPC_BINDING_OR_PROTOCOL_UNVERIFIABLE');
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(0);
    expect(h.ipd.rows.get(FIXTURE_ID)?.status).toBe('ACTIVE');
  });
  it('unrepresentable create receipt and initial read-back mismatch clean up only the verified fixture', async () => {
    for (const fault of ['receipt', 'readback'] as const) {
      const h = await harness();
      if (fault === 'receipt') h.ipd.next = { op: 'portfolio.create', result: ok('portfolio.create', { revision: 1 }), apply: true };
      let gets = 0;
      const call: typeof h.ipd.call = async (op, payload, options) => {
        if (fault === 'readback' && op === 'portfolio.get' && payload?.portfolioId === FIXTURE_ID) {
          gets += 1;
          if (gets === 2) { h.ipd.calls.push({ op, payload: clone(payload ?? {}), requestId: options?.requestId }); return ok(op, { portfolioId: FIXTURE_ID, portfolioName: 'Other', revision: 1, holdings: [], contributions: [] }, options?.requestId); }
        }
        return h.ipd.call(op, payload, options);
      };
      const result = await runStep9Operator(h.config, { ...h.deps, callIpc: call });
      expect(result.status).toBe('STOPPED');
      expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
      expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
      expect(result.http.every((capture) => capture.method === 'GET')).toBe(true);
    }
  });
  it('journal failure before create sends no write and never overwrites an existing transcript', async () => {
    const h = await harness();
    h.evidence.failUpdateAt = 2; // after preflight, before CREATE_PENDING is durable
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe('EVIDENCE_UNAVAILABLE');
    expect(writes(h.ipd)).toHaveLength(0);
    const before = h.evidence.read(h.path);
    const second = await runStep9Operator(h.config, h.deps);
    expect(second.failure?.code).toBe('EVIDENCE_CREATE_FAILED');
    expect(h.evidence.read(h.path)).toEqual(before);
    expect(h.ipd.calls).toHaveLength(4);
  });
  it('cross-process recovery preserves the source transcript and deletes only an intact INITIAL fixture', async () => {
    const h = await harness();
    let getCount = 0;
    const failingRead: typeof h.ipd.call = async (op, payload, options) => {
      if (op === 'portfolio.get' && payload?.portfolioId === FIXTURE_ID) {
        getCount += 1;
        if (getCount >= 2) { h.ipd.calls.push({ op, payload: clone(payload ?? {}), requestId: options?.requestId }); return classP(); }
      }
      return h.ipd.call(op, payload, options);
    };
    const failed = await runStep9Operator(h.config, { ...h.deps, callIpc: failingRead });
    expect(failed.status).toBe('RECOVERY_REQUIRED');
    expect(failed.fixture?.conflictAttempted).toBe(false);
    const source = h.evidence.read(h.path);
    const recovered = await runStep9Operator({ ...h.config, mode: 'recover' }, { ...h.deps, callIpc: h.ipd.call });
    expect(recovered.status).toBe('RECOVERED');
    expect(recovered.recovery?.physicalErasure).toBe(false);
    expect(h.evidence.read(h.path)).toEqual(source);
    expect(h.evidence.files.has(recovered.evidencePath)).toBe(true);
    expect(ops(h.ipd, 'portfolio.create')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
    expect(recovered.http).toHaveLength(0);
  });
  it('recovery refuses tampered identity, changed endpoint, conflict-phase evidence, or changed state without a write', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.create', result: unknown('portfolio.create'), apply: true, after: () => { h.ipd.binding = 'ABSENT'; } };
    await runStep9Operator(h.config, h.deps);
    const source = h.evidence.read(h.path) as Step9Evidence;
    const variants: Array<unknown> = [
      { ...source, fixture: { ...source.fixture!, portfolioId: 'REAL-PORTFOLIO' } },
      { ...source, runtime: { ...source.runtime!, ipcTarget: '/tmp/other.sock' } },
      { ...source, fixture: { ...source.fixture!, conflictAttempted: true } },
      { ...source, status: 'CONFLICT_OBSERVED' },
    ];
    for (const [index, variant] of variants.entries()) {
      const path = `${h.path}-${index}`; h.evidence.create(path, variant as Step9Evidence);
      const before = h.ipd.calls.length;
      const result = await runStep9Operator({ ...h.config, mode: 'recover', evidencePath: path }, h.deps);
      expect(result.status).toBe('STOPPED');
      expect(h.ipd.calls.length).toBe(before);
    }
    h.ipd.binding = 'ACTIVE';
    h.ipd.rows.get(FIXTURE_ID)!.detail.revision = 2;
    const changed = await runStep9Operator({ ...h.config, mode: 'recover' }, h.deps);
    expect(changed.failure?.code).toBe('RECOVERY_STATE_CHANGED');
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(0);
  });
});

  it('interrupted RUNNING pre-conflict evidence is recoverable only after fresh exact-state verification', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.create', result: unknown('portfolio.create'), apply: true, after: () => { h.ipd.binding = 'ABSENT'; } };
    const failed = await runStep9Operator(h.config, h.deps);
    const interrupted = { ...(h.evidence.read(h.path) as Step9Evidence), status: 'RUNNING' as const };
    h.evidence.files.set(h.path, interrupted);
    h.ipd.binding = 'ACTIVE';
    const recovered = await runStep9Operator({ ...h.config, mode: 'recover' }, h.deps);
    expect(failed.status).toBe('RECOVERY_REQUIRED');
    expect(recovered.status).toBe('RECOVERED');
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
  });
  it('journal failure after create still reconciles and cleans the exact fixture', async () => {
    const h = await harness();
    h.evidence.failUpdateAt = 3; // CREATE_PENDING was durable; initial-state update fails
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.failure?.code).toBe('EVIDENCE_UNAVAILABLE');
    expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
    expect(ops(h.ipd, 'portfolio.create')).toHaveLength(1);
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
  });
  it('Route A must observe the created fixture before the conflict request is prepared', async () => {
    const h = await harness();
    const original = h.deps.http;
    let gets = 0;
    const http: NonNullable<Step9Deps['http']> = async (url, init) => {
      if (init.method === 'GET') {
        gets += 1;
        if (gets === 2) return new Response('{"outcome":"RESOURCE_UNAVAILABLE"}', { status: 404 });
      }
      return original ? original(url, init) : fetch(url, init);
    };
    const result = await runStep9Operator(h.config, { ...h.deps, http });
    expect(result.failure).toEqual({ phase: 'F4', code: 'HTTP_REVISION_UNVERIFIABLE' });
    expect(result.http.some((capture) => capture.method === 'POST')).toBe(false);
    expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
  });

describe('Step 9 operator — F6/F7 refusals never become acceptance', () => {
  it.each(['COMMIT', 'MUTATE_AND_CONFLICT'] as const)('unexpected conflict behavior %s fails and cleans the known fixture', async (behavior) => {
    const h = await harness(); h.ipd.conflictBehavior = behavior;
    const result = await runStep9Operator(h.config, h.deps);
    expect(result.status).toBe('STOPPED');
    expect(result.phases.F6).toBe('BLOCKED');
    expect(result.step9).toBe('NOT PASSED');
    expect(result.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
    expect(ops(h.ipd, 'portfolio.delete')).toHaveLength(1);
  });
  it('wrong conflict body/status and failed removal read remain failures, with no delete retry', async () => {
    const h = await harness();
    h.ipd.next = { op: 'portfolio.save', result: refused('portfolio.save', 'INVALID_REQUEST'), apply: false };
    const invalid = await runStep9Operator(h.config, h.deps);
    expect(invalid.failure?.code).toBe('CONFLICT_NOT_OBSERVED');
    expect(invalid.recovery?.disposition).toBe('LOGICAL_REMOVAL_VERIFIED');
    const h2 = await harness();
    h2.ipd.next = { op: 'portfolio.delete', result: unknown('portfolio.delete'), apply: true };
    const result = await runStep9Operator(h2.config, h2.deps);
    expect(result.status).toBe('RECOVERY_REQUIRED');
    expect(result.phases.F7).toBe('BLOCKED');
    expect(ops(h2.ipd, 'portfolio.delete')).toHaveLength(1);
  });
  it('file evidence is exclusive, complete JSON, and recoverable from disk', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'step9-operator-evidence-')); tempDirs.push(dir);
    const path = join(dir, 'run.json');
    const h = await harness();
    const result = await runStep9Operator({ ...h.config, evidencePath: path }, { ...h.deps, evidence: fileStep9EvidenceStore });
    expect(result.status).toBe('CONFLICT_OBSERVED');
    expect(JSON.parse(readFileSync(path, 'utf8')).schema).toBe(STEP9_EVIDENCE_SCHEMA);
    expect(() => fileStep9EvidenceStore.create(path, result)).toThrow();
    expect(JSON.parse(readFileSync(path, 'utf8')).status).toBe('CONFLICT_OBSERVED');
  });
});

/* ------------------------------------------------------------------ *
 * The operator under the real (refusing) identity-qualification gate.
 *
 * With the gate at its production posture, the conflicting write is refused
 * before any socket is opened. The operator must record that refusal as what
 * it is — NOT as a revision conflict it did not observe, and NOT as an
 * acceptance — and the authoritative state must stay untouched.
 * ------------------------------------------------------------------ */
describe('Step 9 operator — under the refusing identity-qualification gate', () => {
  it('records the gate refusal, claims no revision conflict, and leaves the store untouched', async () => {
    const h = await harness({ admitIdentityQualification: false });
    const result = await runStep9Operator(h.config, h.deps);
    // The conflicting write is refused with zero store effect; the lifecycle still
    // completes and the fixture is cleaned up.
    expect(result.status).toBe('CONFLICT_OBSERVED');
    expect(result.refusal).toBe('REFUSED_STORE_GUARD');
    // It never claims a revision conflict it did not observe.
    expect(result.refusal).not.toBe('REVISION_CONFLICT');
    // No broker-import write reached the store.
    expect(ops(h.ipd, 'portfolio.save')).toHaveLength(0);
    expect(h.ipd.rows.get(FIXTURE_ID)?.status).toBe('TOMBSTONED');
  });
});
