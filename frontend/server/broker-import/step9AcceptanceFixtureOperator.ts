/**
 * Step 9 acceptance fixture lifecycle operator — IRR only, local personal use.
 *
 * Authority: PR #523 §5.2 and Ramki's implementation authorization for this file
 * and its targeted tests. IMPLEMENTATION IS NOT EXECUTION AUTHORIZATION. The
 * default CLI performs no IPC/HTTP I/O; --preflight is read-only. A future run
 * requires Ramki's separate execution authorization and --execute-acceptance.
 *
 * F1 runtime → F2 binding → F3 create → F4 initial state → F5 request preparation
 * → F6 Route A conflict + no-effect verification → F7 tombstone + logical removal.
 *
 * Existing surfaces only: IPC v1 portfolio.list/get/revisions/create/delete and
 * Route A POST holdings / GET revision. No portfolio.save/reset IPC call, new HTTP
 * route, owner selection, authorization override, retry, or database access.
 * IIPS_LOCAL_PERSONAL_USE is an additional enablement condition, never authority.
 * IPD remains the authority for W-1, binding resolution and every write guard.
 *
 * Binding evidence is deliberately precise: a valid portfolio.list success proves
 * that IPD resolved its sole ACTIVE A-2 binding and attached ACTIVE membership for
 * that request (dispatch.ts resolves before the read). It does NOT disclose or
 * verify a named owner identity. No owner identifier is accepted or transmitted.
 * Class P cannot distinguish absent/ambiguous binding from another pre-admission
 * refusal, so it is always UNVERIFIABLE and stops before mutation.
 *
 * The IPD process's enablement flag and governance predicates are not readable
 * through this contract. Local checks never claim to verify them. The first and
 * only create request is subject to IPD's authoritative guards; any refusal stops
 * the lifecycle before another mutation. No write probe is used for preflight.
 *
 * Evidence is an operator-owned, exclusively created local transcript, not an
 * application portfolio cache. It contains no credentials or owner identifiers.
 * delete means TOMBSTONED/logically unavailable, never physical database erasure.
 * Even a successful synthetic/authorized lifecycle leaves Step 9 NOT PASSED until
 * a separate result-acceptance decision accepts retained runtime evidence.
 */
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  callIpc,
  IpcClientError,
  IPC_PROTOCOL_VERSION,
  IPC_RESPONSE_MAX_BYTES,
  resolveIpcEndpoint,
  type IpcCallResult,
  type IpcEndpointTarget,
  type IpcOperation,
} from '../user-portfolio/ipcClient.js';
import { ownerContextFromBinding, readBindingPrecondition } from '../user-portfolio/ownerContextFromBinding.js';
import { BROKER_IMPORT_SYMBOL_PATTERN, validateBrokerImportSaveDto, validatePortfolioIdParam, type BrokerImportSaveDto } from './brokerImportBoundary.js';
import { buildV1SavePayload } from './brokerImportV1SaveAdapter.js';

export const STEP9_EVIDENCE_SCHEMA = 'IIPS_STEP9_ACCEPTANCE_OPERATOR_V1';
export const STEP9_FIXTURE_NAME = 'Step9 acceptance fixture';
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const FIXTURE_ID_PATTERN = /^step9-fixture-\d{8}T\d{6}Z-[0-9a-f]{32}$/;
const PHASES = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'] as const;
export type Step9Phase = typeof PHASES[number];
type Mode = 'preflight' | 'execute' | 'recover';
type JsonRecord = Record<string, unknown>;

export interface Step9Config {
  readonly mode: Mode;
  readonly irrOrigin: string;
  readonly evidencePath: string;
}
export interface Step9EvidenceStore {
  create(path: string, record: Step9Evidence): void;
  read(path: string): unknown;
  update(path: string, record: Step9Evidence): void;
}
export interface Step9Deps {
  readonly env?: NodeJS.ProcessEnv;
  readonly platform?: NodeJS.Platform;
  readonly nodeVersion?: string;
  readonly callIpc?: typeof callIpc;
  readonly http?: (url: string, init: RequestInit) => Promise<Response>;
  readonly now?: () => Date;
  readonly uuid?: () => string;
  readonly evidence?: Step9EvidenceStore;
}
interface RuntimeEvidence {
  readonly nodeVersion: string;
  readonly platform: string;
  readonly ipcTarget: string;
  readonly irrOrigin: string;
  readonly localPersonalUseEnabled: true;
  readonly bindingPrecondition: true;
  readonly authority: 'IPD_PER_REQUEST_GUARDS';
}
interface IpcCapture {
  readonly op: IpcOperation;
  readonly payload: JsonRecord;
  readonly requestId: string;
  readonly result: IpcCallResult | { readonly kind: 'LOCAL_REFUSAL'; readonly reason: string };
}
interface HttpCapture {
  readonly method: 'GET' | 'POST';
  readonly url: string;
  readonly requestBody: string | null;
  readonly status: number;
  readonly responseBody: string;
}
interface FixtureEvidence {
  readonly portfolioId: string;
  readonly portfolioName: string;
  readonly createPayload: JsonRecord;
  readonly conflictDto: BrokerImportSaveDto;
  preflightAbsent: boolean;
  createAttempted: boolean;
  conflictAttempted: boolean;
  initialDetail?: JsonRecord;
  initialRevisions?: readonly JsonRecord[];
  initialStateDigest?: string;
}
export interface Step9Evidence {
  readonly schema: typeof STEP9_EVIDENCE_SCHEMA;
  readonly runId: string;
  readonly mode: Mode;
  readonly startedAt: string;
  readonly evidencePath: string;
  readonly step9: 'NOT PASSED';
  status: 'RUNNING' | 'PREFLIGHT_COMPLETE' | 'CONFLICT_OBSERVED' | 'STOPPED' | 'RECOVERY_REQUIRED' | 'RECOVERED';
  readonly runtime?: RuntimeEvidence;
  readonly phases: Partial<Record<Step9Phase, 'PASS' | 'BLOCKED' | 'NOT_RUN'>>;
  readonly ipc: IpcCapture[];
  readonly http: HttpCapture[];
  readonly fixture?: FixtureEvidence;
  /**
   * Which fail-closed boundary refused the F6 conflicting write, recorded verbatim.
   * `REVISION_CONFLICT` — the write reached the store and the revision guard refused it.
   * `REFUSED_STORE_GUARD` — IRR refused the write before any socket was opened, because the
   * governed whole-import identity gate is not applied on the reachable commit path.
   * The two are never collapsed: the operator does not claim a revision conflict it did not
   * observe, and it does not claim an identity gate that did not run.
   */
  refusal?: 'REVISION_CONFLICT' | 'REFUSED_STORE_GUARD';
  readonly recoverySource?: { readonly path: string; readonly sha256: string };
  failure?: { readonly phase: Step9Phase; readonly code: string };
  recovery?: { readonly disposition: 'LOGICAL_REMOVAL_VERIFIED' | 'NO_FIXTURE_OBSERVED'; readonly physicalErasure: false };
}

class OperatorStop extends Error {
  constructor(readonly code: string) { super(code); this.name = 'OperatorStop'; }
}
function stop(code: string): never { throw new OperatorStop(code); }
function object(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function finite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }
function revision(value: unknown): value is number { return finite(value) && Number.isSafeInteger(value) && value >= 0; }
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (object(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function digest(value: unknown): string { return createHash('sha256').update(canonical(value)).digest('hex'); }
function same(left: unknown, right: unknown): boolean { return canonical(left) === canonical(right); }

/** Complete files only: exclusive creation, then fsync + atomic replacement. */
export const fileStep9EvidenceStore: Step9EvidenceStore = {
  create(path, record) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    const fd = openSync(path, 'r+');
    try { fsyncSync(fd); } finally { closeSync(fd); }
  },
  read(path) { return JSON.parse(readFileSync(path, 'utf8')) as unknown; },
  update(path, record) {
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
      const fd = openSync(temporary, 'r+');
      try { fsyncSync(fd); } finally { closeSync(fd); }
      renameSync(temporary, path);
    } finally { rmSync(temporary, { force: true }); }
  },
};

function verifyRuntime(config: Step9Config, deps: Step9Deps): { runtime: RuntimeEvidence; target: IpcEndpointTarget } {
  const env = deps.env ?? process.env;
  const platform = deps.platform ?? process.platform;
  const nodeVersion = deps.nodeVersion ?? process.versions.node;
  const version = /^(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion);
  if (!version || Number(version[1]) < 22 || (Number(version[1]) === 22 && Number(version[2]) < 13)) stop('RUNTIME_NODE_UNSUPPORTED');
  if (platform !== 'win32' && platform !== 'linux' && platform !== 'darwin') stop('RUNTIME_PLATFORM_UNSUPPORTED');
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') stop('RUNTIME_NOT_LOCAL_PERSONAL');
  if (env.IIPS_LOCAL_PERSONAL_USE !== '1') stop('RUNTIME_ENABLEMENT_ABSENT');
  if (!ownerContextFromBinding(readBindingPrecondition(env), env).established) stop('RUNTIME_BINDING_PRECONDITION_ABSENT');
  let url: URL;
  try { url = new URL(config.irrOrigin); } catch { return stop('RUNTIME_IRR_ORIGIN_INVALID'); }
  if (url.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) stop('RUNTIME_IRR_ORIGIN_NOT_LOOPBACK');
  try {
    const target = resolveIpcEndpoint(env, platform);
    return { target, runtime: { nodeVersion, platform, ipcTarget: target.path, irrOrigin: url.origin, localPersonalUseEnabled: true, bindingPrecondition: true, authority: 'IPD_PER_REQUEST_GUARDS' } };
  } catch (error) {
    throw new OperatorStop(error instanceof IpcClientError ? `RUNTIME_${error.kind}` : 'RUNTIME_ENDPOINT_UNVERIFIABLE');
  }
}

async function ipcCall(context: Context, op: IpcOperation, payload: JsonRecord): Promise<IpcCallResult> {
  const requestId = context.uuid();
  let result: IpcCallResult;
  try {
    result = await context.call(op, payload, { target: context.target, requestId });
  } catch (error) {
    context.record.ipc.push({ op, payload, requestId, result: { kind: 'LOCAL_REFUSAL', reason: error instanceof IpcClientError ? error.kind : 'TRANSPORT_FAULT' } });
    return stop('IPC_LOCAL_REFUSAL');
  }
  context.record.ipc.push({ op, payload, requestId, result });
  if ((result.kind === 'SUCCESS' || result.kind === 'CLASS_A') &&
      (result.frame.v !== IPC_PROTOCOL_VERSION || result.frame.op !== op || result.frame.requestId !== requestId)) stop('IPC_PROTOCOL_UNVERIFIABLE');
  if (result.kind === 'CLASS_P') stop('IPC_BINDING_OR_PROTOCOL_UNVERIFIABLE');
  if (result.kind === 'OUTCOME_UNKNOWN') stop(`IPC_OUTCOME_UNKNOWN_${result.reason}`);
  return result;
}
function success(result: IpcCallResult): unknown {
  if (result.kind !== 'SUCCESS') stop(`IPC_${result.kind === 'CLASS_A' ? result.frame.outcome : 'UNVERIFIABLE'}`);
  return result.frame.result;
}
function summaryValid(value: unknown): value is JsonRecord {
  return object(value) && text(value.portfolioId) && text(value.portfolioName) && revision(value.revision) &&
    revision(value.holdingsCount) && finite(value.totalMarketValue) && finite(value.weightSumPercentage) &&
    text(value.lastUpdated) && typeof value.provenanceDigest === 'string' && typeof value.isSaved === 'boolean';
}
async function verifyBinding(context: Context): Promise<JsonRecord[]> {
  const result = success(await ipcCall(context, 'portfolio.list', {}));
  if (!Array.isArray(result) || !result.every(summaryValid) || new Set(result.map((row) => row.portfolioId)).size !== result.length) stop('IPC_LIST_PROTOCOL_UNVERIFIABLE');
  // No owner identity is inferred. Success establishes only per-request resolution
  // of the unique ACTIVE pair; an empty array is a valid authoritative response.
  return result as JsonRecord[];
}
function identityValid(value: unknown, fixture: FixtureEvidence): value is JsonRecord {
  if (!summaryValid(value) || value.portfolioId !== fixture.portfolioId || value.portfolioName !== STEP9_FIXTURE_NAME ||
      !Array.isArray(value.holdings) || value.holdings.length !== 1 || !Array.isArray(value.contributions)) return false;
  const holding: unknown = value.holdings[0];
  const symbol = (fixture.createPayload.holdings as JsonRecord[])[0].symbol;
  return object(holding) && holding.symbol === symbol && holding.companyId === `MANUAL:${String(symbol)}` &&
    holding.sourceBroker === 'manual-personal' && holding.identityStatus === 'UNRESOLVED' &&
    holding.resolutionDisposition === 'MANUAL_PERSONAL_ENTRY';
}
function detailValid(value: unknown, fixture: FixtureEvidence): value is JsonRecord {
  if (!identityValid(value, fixture) || (value.contributions as unknown[]).length !== 0 ||
      value.holdingsCount !== 1 || value.totalMarketValue !== 1 || value.weightSumPercentage !== 100 || typeof value.provenanceDigest !== 'string' || !/^[0-9a-f]{64}$/.test(value.provenanceDigest)) return false;
  const holding: unknown = (value.holdings as unknown[])[0];
  const symbol = (fixture.createPayload.holdings as JsonRecord[])[0].symbol;
  return object(holding) && holding.quantity === 1 && holding.averageBuyPrice === 1 && holding.currentPrice === 1 && holding.marketValue === 1 && holding.weightPercentage === 100 &&
    holding.active === true && holding.sourceBroker === 'manual-personal' && holding.identityStatus === 'UNRESOLVED' &&
    holding.resolutionDisposition === 'MANUAL_PERSONAL_ENTRY' && text(holding.lineageDigest) &&
    (holding.securityIdentity === undefined || holding.securityIdentity === null);
}
async function getFixture(context: Context, fixture: FixtureEvidence): Promise<JsonRecord | null> {
  const result = await ipcCall(context, 'portfolio.get', { portfolioId: fixture.portfolioId });
  if (result.kind === 'CLASS_A') {
    if (result.frame.outcome === 'RESOURCE_UNAVAILABLE') return null;
    stop(`IPC_GET_${result.frame.outcome}`);
  }
  const detail: unknown = success(result);
  if (!identityValid(detail, fixture)) stop('IPC_FIXTURE_OWNERSHIP_OR_IDENTITY_UNVERIFIABLE');
  return detail;
}
async function readRevisions(context: Context, fixture: FixtureEvidence): Promise<JsonRecord[]> {
  const result = success(await ipcCall(context, 'portfolio.revisions', { portfolioId: fixture.portfolioId }));
  if (!Array.isArray(result) || !result.every((row) => object(row) && revision(row.revision) && text(row.operation) &&
    text(row.committedAt) && finite(row.totalMarketValue) && revision(row.holdingsCount) && typeof row.provenanceDigest === 'string' &&
    (row.contentDigest === undefined || typeof row.contentDigest === 'string'))) stop('IPC_REVISIONS_PROTOCOL_UNVERIFIABLE');
  return result as JsonRecord[];
}
function initialRevisionsValid(rows: readonly JsonRecord[], detail: JsonRecord): boolean {
  return rows.length === 1 && rows[0].revision === 1 && rows[0].operation === 'INITIAL' && rows[0].holdingsCount === 1 &&
    rows[0].totalMarketValue === 1 && rows[0].provenanceDigest === detail.provenanceDigest;
}
async function absent(context: Context, fixture: FixtureEvidence): Promise<boolean> {
  const list = await verifyBinding(context);
  if (list.some((row) => row.portfolioId === fixture.portfolioId)) return false;
  return (await getFixture(context, fixture)) === null;
}

async function http(context: Context, method: 'GET' | 'POST', path: string, body?: BrokerImportSaveDto): Promise<HttpCapture> {
  const url = `${context.record.runtime!.irrOrigin}${path}`;
  const requestBody = body === undefined ? null : JSON.stringify(body);
  const headers: Record<string, string> = { Origin: context.record.runtime!.irrOrigin, 'Sec-Fetch-Site': 'same-origin' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let capture: HttpCapture;
  try {
    const response = await context.http(url, { method, headers, ...(requestBody !== null ? { body: requestBody } : {}), redirect: 'manual', signal: AbortSignal.timeout(5_000) });
    const responseBody = await boundedResponseText(response);
    capture = { method, url, requestBody, status: response.status, responseBody };
  } catch {
    capture = { method, url, requestBody, status: 0, responseBody: '' };
  }
  context.record.http.push(capture);
  if (capture.status === 0) stop('HTTP_OUTCOME_UNKNOWN');
  return capture;
}
async function boundedResponseText(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let result = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > IPC_RESPONSE_MAX_BYTES) { await reader.cancel(); stop('HTTP_RESPONSE_OVERSIZE'); }
      result += decoder.decode(chunk.value, { stream: true });
    }
    return result + decoder.decode();
  } finally { reader.releaseLock(); }
}
function jsonBody(capture: HttpCapture): unknown {
  try { return JSON.parse(capture.responseBody) as unknown; } catch { return stop('HTTP_RESPONSE_PROTOCOL_UNVERIFIABLE'); }
}
async function revisionHttp(context: Context, fixture: FixtureEvidence, expected: number | 'ABSENT'): Promise<void> {
  const capture = await http(context, 'GET', `/api/broker-import/${fixture.portfolioId}/revision`);
  const body = jsonBody(capture);
  if (expected === 'ABSENT') {
    if (capture.status !== 404 || !same(body, { outcome: 'RESOURCE_UNAVAILABLE' })) stop('HTTP_INITIAL_ABSENCE_UNVERIFIABLE');
  } else if (capture.status !== 200 || !same(body, { portfolioId: fixture.portfolioId, revision: expected })) stop('HTTP_REVISION_UNVERIFIABLE');
}

interface Context {
  readonly record: Step9Evidence;
  readonly target: IpcEndpointTarget;
  readonly call: typeof callIpc;
  readonly http: NonNullable<Step9Deps['http']>;
  readonly uuid: () => string;
}
function makeFixture(now: Date, uuidToken: string): FixtureEvidence {
  const token = uuidToken.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(token) || !Number.isFinite(now.getTime())) stop('FIXTURE_IDENTITY_GENERATION_FAILED');
  const portfolioId = `step9-fixture-${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-${token}`;
  if (!ID_PATTERN.test(portfolioId) || validatePortfolioIdParam(portfolioId) !== null) stop('FIXTURE_IDENTITY_INVALID');
  const symbol = `S9FIX${token.toUpperCase()}`;
  if (!BROKER_IMPORT_SYMBOL_PATTERN.test(symbol)) stop('FIXTURE_SYMBOL_INVALID');
  const holding = { symbol, quantity: 1, averageBuyPrice: 1, currentPrice: 1 };
  const validated = validateBrokerImportSaveDto({ expectedRevision: 0, mode: 'MERGE', holdings: [{ ...holding, quantity: 2 }] });
  if (!validated.ok) stop('FIXTURE_CONFLICT_DTO_INVALID');
  return { portfolioId, portfolioName: STEP9_FIXTURE_NAME, createPayload: { portfolioId, portfolioName: STEP9_FIXTURE_NAME, holdings: [holding] }, conflictDto: validated.dto, preflightAbsent: false, createAttempted: false, conflictAttempted: false };
}
function createReceiptValid(value: unknown, fixture: FixtureEvidence): value is JsonRecord {
  return object(value) && value.disposition === 'SAVED_NEW_BATCH' && value.revision === 1 && value.isDuplicate === false &&
    value.holdingsSavedCount === 1 && value.totalMarketValue === 1 && value.weightSumPercentage === 100 && text(value.savedAt) &&
    detailValid(value.portfolio, fixture) && typeof value.provenanceDigest === 'string' && /^[0-9a-f]{64}$/.test(value.provenanceDigest) &&
    value.provenanceDigest === value.portfolio.provenanceDigest && value.portfolio.revision === 1 && value.portfolio.isSaved === false;
}
async function establishInitial(context: Context, fixture: FixtureEvidence): Promise<void> {
  const detail = await getFixture(context, fixture);
  if (detail === null || !detailValid(detail, fixture) || detail.revision !== 1 || detail.isSaved !== false) stop('FIXTURE_INITIAL_STATE_UNVERIFIABLE');
  const revisions = await readRevisions(context, fixture);
  if (!initialRevisionsValid(revisions, detail)) stop('FIXTURE_INITIAL_REVISION_UNVERIFIABLE');
  fixture.initialDetail = detail;
  fixture.initialRevisions = revisions;
  fixture.initialStateDigest = digest({ detail, revisions });
}

/** One cleanup attempt, only for the exact fixture created/reconciled by this run. */
async function cleanup(context: Context, fixture: FixtureEvidence): Promise<'LOGICAL_REMOVAL_VERIFIED' | 'NO_FIXTURE_OBSERVED'> {
  context.record.phases.F7 = 'NOT_RUN';
  await verifyBinding(context);
  const detail = await getFixture(context, fixture);
  if (detail === null) {
    if (!(await absent(context, fixture))) stop('CLEANUP_LOGICAL_REMOVAL_UNVERIFIABLE');
    context.record.phases.F7 = 'PASS';
    return 'NO_FIXTURE_OBSERVED';
  }
  if (!revision(detail.revision) || detail.revision < 1) stop('CLEANUP_REVISION_UNVERIFIABLE');
  const result = success(await ipcCall(context, 'portfolio.delete', { portfolioId: fixture.portfolioId, expectedRevision: detail.revision }));
  if (!object(result) || result.portfolioId !== fixture.portfolioId || !text(result.deletedAt) || Object.keys(result).sort().join(',') !== 'deletedAt,portfolioId') stop('CLEANUP_DELETE_RECEIPT_UNVERIFIABLE');
  if (!(await absent(context, fixture))) stop('CLEANUP_LOGICAL_REMOVAL_UNVERIFIABLE');
  context.record.phases.F7 = 'PASS';
  return 'LOGICAL_REMOVAL_VERIFIED';
}

async function recover(context: Context, prior: unknown): Promise<void> {
  if (!object(prior) || prior.schema !== STEP9_EVIDENCE_SCHEMA || prior.mode !== 'execute' || !text(prior.runId) ||
      !object(prior.runtime) || !object(prior.fixture) || !Array.isArray(prior.ipc) || !Array.isArray(prior.http)) stop('RECOVERY_EVIDENCE_INVALID');
  const fixture = prior.fixture as unknown as FixtureEvidence;
  if (typeof fixture.portfolioId !== 'string' || !FIXTURE_ID_PATTERN.test(fixture.portfolioId) || fixture.portfolioName !== STEP9_FIXTURE_NAME ||
      !object(fixture.createPayload) || !Array.isArray(fixture.createPayload.holdings) || fixture.createPayload.holdings.length !== 1 ||
      !object(fixture.createPayload.holdings[0]) || !object(fixture.conflictDto) || fixture.preflightAbsent !== true ||
      fixture.createAttempted !== true || fixture.conflictAttempted !== false || !['RECOVERY_REQUIRED', 'RUNNING'].includes(String(prior.status))) stop('RECOVERY_NOT_ELIGIBLE');
  const expected = makeFixture(new Date(prior.startedAt as string), fixture.portfolioId.split('-').pop()!);
  if (!same(expected.createPayload, fixture.createPayload) || !same(expected.conflictDto, fixture.conflictDto) ||
      prior.runtime.ipcTarget !== context.record.runtime!.ipcTarget) stop('RECOVERY_IDENTITY_OR_ENDPOINT_MISMATCH');
  await verifyBinding(context);
  context.record.phases.F2 = 'PASS';
  const detail = await getFixture(context, fixture);
  if (detail === null) {
    if (!(await absent(context, fixture))) stop('RECOVERY_ABSENCE_UNVERIFIABLE');
    context.record.recovery = { disposition: 'NO_FIXTURE_OBSERVED', physicalErasure: false };
    context.record.status = 'RECOVERED';
    return;
  }
  // Cross-process recovery is limited to an intact INITIAL fixture. A fixture
  // touched by the conflict phase needs a new operator decision, not blind cleanup.
  if (!detailValid(detail, fixture) || detail.revision !== 1 || detail.isSaved !== false) stop('RECOVERY_STATE_CHANGED');
  if (fixture.initialStateDigest !== undefined) {
    const revisions = await readRevisions(context, fixture);
    if (digest({ detail, revisions }) !== fixture.initialStateDigest) stop('RECOVERY_STATE_CHANGED');
  }
  const disposition = await cleanup(context, fixture);
  context.record.recovery = { disposition, physicalErasure: false };
  context.record.status = 'RECOVERED';
}

/** Exported for isolated tests; the CLI alone owns process exit and arguments. */
export async function runStep9Operator(config: Step9Config, deps: Step9Deps = {}): Promise<Step9Evidence> {
  const now = deps.now ?? (() => new Date());
  const uuid = deps.uuid ?? randomUUID;
  const store = deps.evidence ?? fileStep9EvidenceStore;
  const sourcePath = resolve(config.evidencePath);
  const recoveryRunId = uuid();
  const path = config.mode === 'recover' ? `${sourcePath}.recovery-${recoveryRunId}.json` : sourcePath;
  const prior = config.mode === 'recover' ? store.read(sourcePath) : undefined;
  const record: Step9Evidence = {
    schema: STEP9_EVIDENCE_SCHEMA, runId: config.mode === 'recover' && object(prior) && text(prior.runId) ? prior.runId : uuid(),
    mode: config.mode, startedAt: now().toISOString(),
    evidencePath: path, step9: 'NOT PASSED', status: 'RUNNING', phases: Object.fromEntries(PHASES.map((phase) => [phase, 'NOT_RUN'])), ipc: [], http: [],
  };
  let target: IpcEndpointTarget | undefined;
  let phase: Step9Phase = 'F1';
  let fixture: FixtureEvidence | undefined;
  let created = false;
  let cleanupAttempted = false;
  let journalReady = false;
  const persist = (): void => {
    try { store.update(path, record); } catch { return stop('EVIDENCE_UNAVAILABLE'); }
  };
  try {
    const runtime = verifyRuntime(config, deps);
    target = runtime.target;
    (record as { runtime?: RuntimeEvidence }).runtime = runtime.runtime;
    record.phases.F1 = 'PASS';
    if (config.mode === 'recover') (record as { recoverySource?: Step9Evidence['recoverySource'] }).recoverySource = { path: sourcePath, sha256: digest(prior) };
    try { store.create(path, record); } catch { return stop('EVIDENCE_CREATE_FAILED'); }
    journalReady = true;
    const context: Context = { record, target, call: deps.callIpc ?? callIpc, http: deps.http ?? ((url, init) => fetch(url, init)), uuid };
    phase = 'F2';
    if (config.mode === 'recover') {
      await recover(context, prior);
      const sourceFixture = (prior as { fixture: FixtureEvidence }).fixture;
      // Copy only fields validated by recover(); never echo arbitrary journal keys.
      (record as { fixture?: FixtureEvidence }).fixture = {
        portfolioId: sourceFixture.portfolioId, portfolioName: STEP9_FIXTURE_NAME,
        createPayload: sourceFixture.createPayload, conflictDto: sourceFixture.conflictDto,
        preflightAbsent: true, createAttempted: true, conflictAttempted: false,
        ...(sourceFixture.initialStateDigest !== undefined ? {
          initialDetail: sourceFixture.initialDetail, initialRevisions: sourceFixture.initialRevisions,
          initialStateDigest: sourceFixture.initialStateDigest,
        } : {}),
      };
      persist();
      return record;
    }
    await verifyBinding(context);
    record.phases.F2 = 'PASS';
    fixture = makeFixture(now(), uuid());
    (record as { fixture?: FixtureEvidence }).fixture = fixture;
    if (!(await absent(context, fixture))) stop('FIXTURE_ID_ALREADY_EXISTS');
    await revisionHttp(context, fixture, 'ABSENT');
    fixture.preflightAbsent = true;
    persist();
    if (config.mode === 'preflight') {
      record.status = 'PREFLIGHT_COMPLETE';
      persist();
      return record;
    }
    phase = 'F3';
    fixture.createAttempted = true;
    persist(); // Durable identity exists BEFORE the first mutation.
    const create = await ipcCall(context, 'portfolio.create', fixture.createPayload);
    if (create.kind === 'CLASS_A') stop(`CREATE_${create.frame.outcome}`);
    const receipt: unknown = success(create);
    if (!createReceiptValid(receipt, fixture)) stop('CREATE_RECEIPT_UNVERIFIABLE');
    created = true;
    record.phases.F3 = 'PASS';
    phase = 'F4';
    await establishInitial(context, fixture);
    if (!same(receipt.portfolio, fixture.initialDetail)) stop('CREATE_READ_BACK_MISMATCH');
    await verifyBinding(context);
    if (!same(await getFixture(context, fixture), fixture.initialDetail)) stop('FIXTURE_BINDING_OR_STATE_CHANGED');
    await revisionHttp(context, fixture, 1);
    record.phases.F3 = 'PASS';
    record.phases.F4 = 'PASS';
    persist();
    phase = 'F5';
    const validated = validateBrokerImportSaveDto(fixture.conflictDto);
    if (!validated.ok || validated.dto.expectedRevision !== 0 || validated.dto.mode !== 'MERGE' || 'operation' in buildV1SavePayload(fixture.portfolioId, validated.dto)) stop('CONFLICT_REQUEST_INVALID');
    record.phases.F5 = 'PASS';
    persist();
    phase = 'F6';
    fixture.conflictAttempted = true;
    persist();
    const conflict = await http(context, 'POST', `/api/broker-import/${fixture.portfolioId}/holdings`, validated.dto);
    // F6 proves that a conflicting write is REFUSED and leaves the store untouched. The
    // refusal may arrive from either of two fail-closed boundaries, and both are correct:
    //
    //   409 REVISION_CONFLICT   — the write reached the store and the revision guard refused it.
    //   422 REFUSED_STORE_GUARD — IRR refused the write BEFORE any socket was opened, because
    //                              the governed whole-import identity gate is not applied on the
    //                              commit path this host reaches. Zero store effect, no identity
    //                              assigned, nothing written.
    //
    // Both leave the authoritative state byte-identical, which is what F6 verifies below.
    // The distinction is recorded, never collapsed: the operator does not claim a revision
    // conflict it did not observe, and it does not claim a governed identity gate that did
    // not run.
    const conflictBody = jsonBody(conflict);
    const conflictRefusedByRevisionGuard =
      conflict.status === 409 && same(conflictBody, { outcome: 'REVISION_CONFLICT' });
    const conflictRefusedByIdentityGate =
      conflict.status === 422
      && conflictBody !== null
      && typeof conflictBody === 'object'
      && (conflictBody as JsonRecord).outcome === 'REFUSED_STORE_GUARD';
    if (!conflictRefusedByRevisionGuard && !conflictRefusedByIdentityGate) stop('CONFLICT_NOT_OBSERVED');
    record.refusal = conflictRefusedByRevisionGuard ? 'REVISION_CONFLICT' : 'REFUSED_STORE_GUARD';
    await verifyBinding(context);
    const after = await getFixture(context, fixture);
    const afterRevisions = await readRevisions(context, fixture);
    if (!same(after, fixture.initialDetail) || !same(afterRevisions, fixture.initialRevisions) || digest({ detail: after, revisions: afterRevisions }) !== fixture.initialStateDigest) stop('CONFLICT_STORE_EFFECT_DETECTED');
    await revisionHttp(context, fixture, 1);
    record.phases.F6 = 'PASS';
    persist();
    phase = 'F7';
    cleanupAttempted = true;
    const disposition = await cleanup(context, fixture);
    if (disposition !== 'LOGICAL_REMOVAL_VERIFIED') stop('CLEANUP_UNEXPECTED_ABSENCE');
    record.recovery = { disposition, physicalErasure: false };
    await revisionHttp(context, fixture, 'ABSENT');
    record.status = 'CONFLICT_OBSERVED';
    persist();
    return record;
  } catch (error) {
    const code = error instanceof OperatorStop ? error.code : 'OPERATOR_FAULT';
    record.phases[phase] = 'BLOCKED';
    record.failure = { phase, code };
    record.status = !fixture?.createAttempted || code.startsWith('CREATE_') ? 'STOPPED' : 'RECOVERY_REQUIRED';
    if (fixture?.createAttempted && (created || code.startsWith('IPC_OUTCOME_UNKNOWN') || code === 'CREATE_RECEIPT_UNVERIFIABLE' || code === 'CREATE_UNAVAILABLE' || code === 'CREATE_RESOURCE_UNAVAILABLE' || code === 'IPC_LOCAL_REFUSAL' || code === 'OPERATOR_FAULT') && !cleanupAttempted && target) {
      // A possibly committed create is reconciled read-only first. No delete is
      // issued unless the exact generated fixture is visible under the fresh binding.
      const context: Context = { record, target, call: deps.callIpc ?? callIpc, http: deps.http ?? ((url, init) => fetch(url, init)), uuid };
      try {
        cleanupAttempted = true;
        const disposition = await cleanup(context, fixture);
        record.recovery = { disposition, physicalErasure: false };
        record.status = 'STOPPED';
      } catch (cleanupError) {
        record.status = 'RECOVERY_REQUIRED';
        record.phases.F7 = 'BLOCKED';
        record.failure = { phase, code: `${code};CLEANUP_${cleanupError instanceof OperatorStop ? cleanupError.code : 'OPERATOR_FAULT'}` };
      }
    }
    if (record.recovery?.disposition === 'NO_FIXTURE_OBSERVED' || (cleanupAttempted && record.recovery?.disposition === 'LOGICAL_REMOVAL_VERIFIED')) record.status = 'STOPPED';
    if (journalReady) {
      try { persist(); } catch { /* Never turn a failed/refused run into success because evidence writing failed. */ }
    }
    return record;
  }
}

const HELP = `Step 9 fixture operator — implementation does not authorize execution.
Usage (from frontend): npx tsx server/broker-import/step9AcceptanceFixtureOperator.ts MODE --irr-origin http://127.0.0.1:8787 --evidence PATH
MODE: --preflight (reads only) | --execute-acceptance (requires Ramki's separate execution authorization) | --recover (existing eligible evidence only)
No arguments prints this help without I/O. No owner, portfolio ID, holdings, authority override, or retry option exists.
Read IRR docs/integration/STEP-9-FIXTURE-OPERATOR-IMPLEMENTATION-2026-11-08.md before any run.
`;
export function parseStep9Args(args: readonly string[]): Step9Config | null {
  if (args.length === 0) return null;
  const modes = args.filter((arg) => ['--preflight', '--execute-acceptance', '--recover'].includes(arg));
  if (modes.length !== 1 || args.length !== 5 || args[0] !== modes[0]) throw new OperatorStop('CLI_ARGUMENTS_INVALID');
  const values = new Map<string, string>();
  for (let index = 1; index < args.length; index += 2) {
    const key = args[index]; const value = args[index + 1];
    if (!['--irr-origin', '--evidence'].includes(key) || values.has(key) || !text(value)) throw new OperatorStop('CLI_ARGUMENTS_INVALID');
    values.set(key, value);
  }
  if (!values.has('--irr-origin') || !values.has('--evidence')) throw new OperatorStop('CLI_ARGUMENTS_INVALID');
  return { mode: modes[0] === '--preflight' ? 'preflight' : modes[0] === '--recover' ? 'recover' : 'execute', irrOrigin: values.get('--irr-origin')!, evidencePath: values.get('--evidence')! };
}
export async function step9Cli(args: readonly string[]): Promise<number> {
  let config: Step9Config | null;
  try { config = parseStep9Args(args); } catch { process.stderr.write(HELP); return 2; }
  if (config === null) { process.stdout.write(HELP); return 0; }
  const result = await runStep9Operator(config);
  process.stdout.write(`${JSON.stringify({ status: result.status, failure: result.failure ?? null, step9: result.step9, evidencePath: result.evidencePath })}\n`);
  return result.status === 'PREFLIGHT_COMPLETE' || result.status === 'CONFLICT_OBSERVED' || result.status === 'RECOVERED' ? 0 : 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  void step9Cli(process.argv.slice(2)).then((code) => { process.exitCode = code; }).catch(() => { process.stderr.write('Step 9 operator failed closed; no acceptance pass is claimed.\n'); process.exitCode = 1; });
}
