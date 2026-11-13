/**
 * UTILITY TESTS for the W11 dependency 1 capture core — MOCKED IPC.
 *
 * WHAT THESE ARE
 *   Tests of the capture utility's own logic: sequencing, portfolio identification,
 *   outcome classification, consistency checks, bounded recapture, sanitization and the
 *   read-only guard. The IPC is a scripted mock injected at the same seam the existing
 *   adapter exposes for tests.
 *
 * WHAT THESE ARE NOT
 *   They are NOT capture evidence. Every portfolio below is fabricated. Nothing here
 *   touches IPD, a database, a binding or a Windows host, and a passing run says nothing
 *   about the actual owner-bound persisted portfolio. W11 acceptance dependency 1 is
 *   satisfied only by a consistent capture taken on the Windows host.
 *
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  IPC_READ_OPERATIONS,
  IPC_WRITE_OPERATIONS,
  type IpcCallResult,
  type IpcClassAOutcome,
  type IpcOperation,
} from '../ipcClient.js';
import { BINDING_PRECONDITION_SETTING } from '../ownerContextFromBinding.js';
import {
  buildExactCaptureDocument,
  buildSanitizedSummary,
  CAPTURE_EXIT_CODES,
  CAPTURE_REQUEST_SEQUENCE,
  captureOwnerBoundPortfolio,
  CaptureReadOnlyViolation,
  createRecordingReadOnlyTransport,
  MAX_ATTEMPTS_LIMIT,
  summarizeHoldingIdentity,
  SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX,
  validateCaptureConfiguration,
  type CaptureOptions,
  type CaptureResult,
  type CaptureTransport,
} from './ownerBoundPortfolioCapture.js';

/* ------------------------------------------------------------------ *
 * Fabricated fixtures. Every value that must never reach the console or the sanitized
 * summary is a recognisable sentinel, so a leak is a string match.
 * ------------------------------------------------------------------ */

const PORTFOLIO_ID = 'SENTINEL-PORTFOLIO-ID-7Q';
const OTHER_PORTFOLIO_ID = 'SENTINEL-OTHER-PORTFOLIO-ID-9Z';
const PORTFOLIO_NAME = 'SENTINEL-PORTFOLIO-NAME';
const DIGEST = `${'ab'.repeat(28)}5e471e1d`;
const OTHER_DIGEST = `${'cd'.repeat(28)}0ddd16e5`;
const SYMBOL_A = 'SENTINELSYMA';
const SYMBOL_B = 'SENTINELSYMB';
const COMPANY_A = 'SENTINEL-COMPANY-A';
const ISIN_A = 'IN5E47INEL01';
const SECURITY_ID_A = `ISIN:${ISIN_A}:EQ`;
const LINEAGE = 'SENTINEL-LINEAGE-DIGEST';
const BROKER_FILE = 'SENTINEL-broker-file.csv';
const MARKET_VALUE = 98765.4321;
const STORED_LAST_UPDATED = '2026-11-01T03:04:05.000Z';
const STORED_COMMITTED_AT = '2026-11-01T03:04:04.000Z';

const SENSITIVE_SENTINELS: readonly string[] = [
  PORTFOLIO_ID,
  OTHER_PORTFOLIO_ID,
  PORTFOLIO_NAME,
  DIGEST,
  OTHER_DIGEST,
  SYMBOL_A,
  SYMBOL_B,
  COMPANY_A,
  ISIN_A,
  SECURITY_ID_A,
  LINEAGE,
  BROKER_FILE,
  String(MARKET_VALUE),
];

function holdingA(): Record<string, unknown> {
  return {
    symbol: SYMBOL_A,
    companyId: COMPANY_A,
    quantity: 10,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: MARKET_VALUE,
    weightPercentage: 60,
    active: true,
    sourceBroker: 'SENTINEL-BROKER',
    lineageDigest: LINEAGE,
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
    securityIdentity: { securityId: SECURITY_ID_A, isin: ISIN_A, series: 'EQ', isinAuthority: 'NON_AUTHORITATIVE' },
  };
}

/** Explicitly unresolved upstream: `securityIdentity` is null. The symbol LOOKS like an ISIN on purpose. */
function holdingB(): Record<string, unknown> {
  return {
    symbol: SYMBOL_B,
    companyId: 'SENTINEL-COMPANY-B',
    quantity: 5,
    averageBuyPrice: 50,
    currentPrice: 55,
    marketValue: 275,
    weightPercentage: 40,
    active: true,
    sourceBroker: 'manual-personal',
    lineageDigest: '',
    identityStatus: 'UNRESOLVED',
    resolutionDisposition: 'MANUAL_PERSONAL_ENTRY',
    securityIdentity: null,
  };
}

interface DetailOverrides {
  readonly portfolioId?: string;
  readonly revision?: number;
  readonly provenanceDigest?: string;
  readonly holdings?: Record<string, unknown>[];
  readonly holdingsCount?: number;
  readonly extra?: Record<string, unknown>;
}

function summaryRow(overrides: DetailOverrides = {}): Record<string, unknown> {
  const holdings = overrides.holdings ?? [holdingA(), holdingB()];
  return {
    portfolioId: overrides.portfolioId ?? PORTFOLIO_ID,
    portfolioName: PORTFOLIO_NAME,
    revision: overrides.revision ?? 3,
    holdingsCount: overrides.holdingsCount ?? holdings.length,
    totalMarketValue: MARKET_VALUE,
    lastUpdated: STORED_LAST_UPDATED,
    weightSumPercentage: 100,
    provenanceDigest: overrides.provenanceDigest ?? DIGEST,
    isSaved: true,
  };
}

function detail(overrides: DetailOverrides = {}): Record<string, unknown> {
  return {
    ...summaryRow(overrides),
    holdings: overrides.holdings ?? [holdingA(), holdingB()],
    contributions: [],
    importEvidence: [
      {
        contentDigest: 'SENTINEL-CONTENT-DIGEST',
        lineageDigest: LINEAGE,
        fileName: BROKER_FILE,
        sourceBroker: 'SENTINEL-BROKER',
        importedAt: STORED_COMMITTED_AT,
        contributedAt: STORED_COMMITTED_AT,
        semantics: 'SAVED_NEW_BATCH',
      },
    ],
    ...(overrides.extra ?? {}),
  };
}

function revisionRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    revision: 3,
    operation: 'MERGE',
    committedAt: STORED_COMMITTED_AT,
    totalMarketValue: MARKET_VALUE,
    provenanceDigest: DIGEST,
    holdingsCount: 2,
    ...overrides,
  };
}

function olderRevisionRow(): Record<string, unknown> {
  return revisionRow({ revision: 2, operation: 'INITIAL', provenanceDigest: OTHER_DIGEST, holdingsCount: 1 });
}

function success(op: IpcOperation, result: unknown): IpcCallResult {
  return { kind: 'SUCCESS', frame: { v: 1, ok: true, op, result }, bytesReceived: 128 };
}

function classA(op: IpcOperation, outcome: IpcClassAOutcome): IpcCallResult {
  return { kind: 'CLASS_A', frame: { v: 1, ok: false, op, outcome, detail: 'SENTINEL-SERVER-DETAIL' }, bytesReceived: 64 };
}

const CLASS_P: IpcCallResult = { kind: 'CLASS_P', bytesReceived: 0, reason: null };

function unknownOutcome(op: IpcOperation, reason: 'TIMEOUT' | 'TRANSPORT_FAULT'): IpcCallResult {
  return { kind: 'OUTCOME_UNKNOWN', reason, op, write: false, retried: false };
}

interface SentRequest {
  readonly op: IpcOperation;
  readonly payload: Record<string, unknown> | undefined;
}

interface MockIpc {
  readonly transport: CaptureTransport;
  readonly sent: SentRequest[];
}

type Responder = (request: SentRequest, index: number) => IpcCallResult;

/** The mocked IPC: records every request and answers from `responder`. */
function mockIpc(responder: Responder): MockIpc {
  const sent: SentRequest[] = [];
  const transport: CaptureTransport = async (op, payload) => {
    const request = { op, payload };
    sent.push(request);
    return responder(request, sent.length - 1);
  };
  return { transport, sent };
}

/** One consistent attempt, optionally with replacements per position (0 = list … 3 = second get). */
function consistentAttempt(replacements: Partial<Record<number, IpcCallResult>> = {}): IpcCallResult[] {
  const base: IpcCallResult[] = [
    success('portfolio.list', [summaryRow()]),
    success('portfolio.get', detail()),
    success('portfolio.revisions', [olderRevisionRow(), revisionRow()]),
    success('portfolio.get', detail()),
  ];
  return base.map((result, index) => replacements[index] ?? result);
}

function scripted(...attempts: IpcCallResult[][]): Responder {
  const flat = attempts.flat();
  return (_request, index) => {
    const result = flat[index];
    if (result === undefined) throw new Error(`the mocked IPC has no response scripted for request ${index + 1}`);
    return result;
  };
}

const VALID_ENV: NodeJS.ProcessEnv = {
  IIPS_G2_IPC_ENDPOINT: '/tmp/iips-w11-dep1-mock.sock',
  [BINDING_PRECONDITION_SETTING]: 'true',
};

interface Harness {
  readonly result: CaptureResult;
  readonly ipc: MockIpc;
  readonly progress: string[];
  readonly sleeps: number[];
}

async function run(responder: Responder, overrides: Partial<CaptureOptions> = {}): Promise<Harness> {
  const ipc = mockIpc(responder);
  const progress: string[] = [];
  const sleeps: number[] = [];
  let tick = 0;
  const result = await captureOwnerBoundPortfolio({
    env: VALID_ENV,
    platform: 'linux',
    transport: ipc.transport,
    // A deterministic CONSUMER clock, far from every stored instant in the fixtures.
    now: () => new Date(Date.UTC(2030, 0, 1, 0, 0, tick++)),
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds);
    },
    onProgress: (line) => progress.push(line),
    captureId: '00000000-0000-4000-8000-000000000000',
    ...overrides,
  });
  return { result, ipc, progress, sleeps };
}

function expectNoSentinel(text: string): void {
  for (const sentinel of SENSITIVE_SENTINELS) expect(text, `leaked ${sentinel}`).not.toContain(sentinel);
}

function operations(ipc: MockIpc): IpcOperation[] {
  return ipc.sent.map((request) => request.op);
}

/* ------------------------------------------------------------------ */

describe('full capture sequence (mocked IPC — utility test, not evidence)', () => {
  it('accepts one attempt whose four reads agree, and exits zero', async () => {
    const { result, ipc } = await run(scripted(consistentAttempt()));

    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    expect(result.exitCode).toBe(0);
    expect(result.attempts).toHaveLength(1);
    expect(result.accepted).not.toBeNull();
    expect(result.accepted?.identifiedPortfolioId).toBe(PORTFOLIO_ID);
    expect(result.accepted?.selectionMethod).toBe('SOLE_LISTED_PORTFOLIO');
    expect(result.accepted?.consistency.consistent).toBe(true);
    expect(result.accepted?.consistency.checks.every((check) => check.passed)).toBe(true);
    expect(result.accepted?.matchingHistoryEntry.revision).toBe(3);
    expect(ipc.sent).toHaveLength(4);
  });

  it('sends exactly list → get → revisions → get, with the payloads the existing adapter builds', async () => {
    const { ipc, result } = await run(scripted(consistentAttempt()));

    expect(operations(ipc)).toEqual(['portfolio.list', 'portfolio.get', 'portfolio.revisions', 'portfolio.get']);
    expect(operations(ipc)).toEqual([...CAPTURE_REQUEST_SEQUENCE]);
    expect(result.accepted?.requestSequence).toEqual([...CAPTURE_REQUEST_SEQUENCE]);
    // `portfolio.list` carries no payload; the three others carry the id read from the list — and only that.
    expect(ipc.sent[0].payload).toBeUndefined();
    expect(ipc.sent[1].payload).toEqual({ portfolioId: PORTFOLIO_ID });
    expect(ipc.sent[2].payload).toEqual({ portfolioId: PORTFOLIO_ID });
    expect(ipc.sent[3].payload).toEqual({ portfolioId: PORTFOLIO_ID });
  });

  it('brackets the reads with CONSUMER timestamps and never presents them as IPD instants', async () => {
    const { result } = await run(scripted(consistentAttempt()));
    const accepted = result.accepted!;

    // Step 1 before the first request; step 6 after the last response.
    expect(accepted.startedAtUtc < accepted.calls[0].requestedAtUtc).toBe(true);
    expect(accepted.completedAtUtc > accepted.calls[3].respondedAtUtc).toBe(true);
    expect(accepted.startedAtUtc.startsWith('2030-01-01T')).toBe(true);

    const summary = buildSanitizedSummary(result, {}, { written: false, fileName: null, sha256: null, bytes: null });
    const observation = summary.consumerObservation as Record<string, string>;
    expect(observation.firstReadStartedAtUtc).toBe(accepted.startedAtUtc);
    expect(observation.finalReadCompletedAtUtc).toBe(accepted.completedAtUtc);
    expect(observation.note).toContain('NOT IPD persistence');
    // IPD's stored instants are carried separately, verbatim, and labelled as IPD-reported.
    const stored = (summary.portfolio as Record<string, Record<string, string>>).ipdReportedStoredInstants;
    expect(stored.lastUpdated).toBe(STORED_LAST_UPDATED);
    expect(stored.matchingRevisionCommittedAt).toBe(STORED_COMMITTED_AT);
    expect(observation.firstReadStartedAtUtc).not.toBe(STORED_LAST_UPDATED);
  });

  it('records the wire result verbatim in the exact capture and labels the G2 view as an IRR mirror', async () => {
    const { result } = await run(scripted(consistentAttempt()));
    const exact = buildExactCaptureDocument(result, {}) as Record<string, any>;

    expect(exact.classification).toContain('LOCAL-ONLY');
    expect(exact.reads.map((read: { operation: string }) => read.operation)).toEqual([...CAPTURE_REQUEST_SEQUENCE]);
    expect(exact.reads[1].wireResult).toEqual(detail());
    expect(exact.reads[3].wireResult).toEqual(detail());
    expect(exact.reads[1].wireResult.holdings[0].securityIdentity.securityId).toBe(SECURITY_ID_A);
    expect(exact.reads[1].wireResult.holdings[1].securityIdentity).toBeNull();
    expect(exact.wireTypes['portfolio.get']).toBe('LocalPortfolioDetail');
    expect(exact.irrMirror.note).toContain('IRR-side mirror, not an IPD wire type');
    expect(exact.ownerContext.bindingIdentifiedByResponse).toBe(false);
    expect(exact.build.ipdBuildOnWire).toContain('NOT_AVAILABLE');
    expect(exact.protocol.responseProtocolVersionsObserved).toEqual([1]);
    // This mocked run is declared as Linux, so it can never be offered as evidence.
    expect(exact.evidenceEligibility).toBe('NOT_EVIDENCE_NOT_A_WINDOWS_HOST');
  });

  it('offers a consistent capture for REVIEW only when it ran on Windows, and never as accepted', async () => {
    const windowsEnv = { IIPS_G2_IPC_ENDPOINT: '\\\\.\\pipe\\iips-mock-pipe', [BINDING_PRECONDITION_SETTING]: 'true' };
    const onWindows = await run(scripted(consistentAttempt()), { platform: 'win32', env: windowsEnv });
    const onLinux = await run(scripted(consistentAttempt()));
    const none = { written: false, fileName: null, sha256: null, bytes: null };

    expect(onWindows.result.outcome).toBe('CONSISTENT_CAPTURE');
    const windowsSummary = buildSanitizedSummary(onWindows.result, {}, none);
    expect(windowsSummary.evidenceEligibility).toBe('HOST_CAPTURE_SUBJECT_TO_REVIEW');
    expect(String(windowsSummary.peerAuthenticity)).toContain('NOT_ATTESTED');
    expect(JSON.stringify(windowsSummary)).not.toMatch(/ACCEPTED|"accepted":\s*true/);

    const linuxSummary = buildSanitizedSummary(onLinux.result, {}, none);
    expect(linuxSummary.evidenceEligibility).toBe('NOT_EVIDENCE_NOT_A_WINDOWS_HOST');
    expect((linuxSummary.caveats as string[]).some((caveat) => caveat.startsWith('NOT A WINDOWS HOST'))).toBe(true);
  });

  it('labels a plain PortfolioDetail (no importEvidence) by what the wire actually returned', async () => {
    const plain = detail();
    delete plain.importEvidence;
    const { result } = await run(
      scripted(consistentAttempt({ 1: success('portfolio.get', plain), 3: success('portfolio.get', { ...plain }) })),
    );
    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    const exact = buildExactCaptureDocument(result, {}) as Record<string, any>;
    expect(exact.wireTypes['portfolio.get']).toBe('PortfolioDetail');
  });

  it('refuses to build an exact capture for anything but a consistent capture', async () => {
    const { result } = await run(scripted([CLASS_P]));
    expect(() => buildExactCaptureDocument(result, {})).toThrow();
  });
});

describe('portfolio identification — from the actual list response, never guessed', () => {
  it('stops when IPD lists no portfolio, and creates nothing', async () => {
    const { result, ipc } = await run(scripted([success('portfolio.list', [])]));

    expect(result.outcome).toBe('AMBIGUOUS_OR_MISSING_PORTFOLIO');
    expect(result.reasonCode).toBe('NO_PORTFOLIO_LISTED');
    expect(result.exitCode).toBe(CAPTURE_EXIT_CODES.AMBIGUOUS_OR_MISSING_PORTFOLIO);
    expect(operations(ipc)).toEqual(['portfolio.list']);
    expect(result.accepted).toBeNull();
  });

  it('stops when several portfolios are listed and none was selected — no default is assumed', async () => {
    const listed = [summaryRow(), summaryRow({ portfolioId: OTHER_PORTFOLIO_ID }), summaryRow({ portfolioId: 'DEFAULT_PORTFOLIO' })];
    const { result, ipc } = await run(scripted([success('portfolio.list', listed)]));

    expect(result.outcome).toBe('AMBIGUOUS_OR_MISSING_PORTFOLIO');
    expect(result.reasonCode).toBe('MULTIPLE_PORTFOLIOS_LISTED_NONE_SELECTED');
    expect(result.exitCode).toBe(12);
    // Only the list was sent: DEFAULT_PORTFOLIO was listed and still not picked.
    expect(operations(ipc)).toEqual(['portfolio.list']);
    expect(JSON.stringify(ipc.sent)).not.toContain('DEFAULT_PORTFOLIO');
    expect(result.listedPortfolioCount).toBe(3);
    // The candidates exist for the LOCAL-ONLY file only.
    expect(result.candidates?.map((candidate) => candidate.portfolioId)).toEqual([
      PORTFOLIO_ID,
      OTHER_PORTFOLIO_ID,
      'DEFAULT_PORTFOLIO',
    ]);
  });

  it('never sends DEFAULT_PORTFOLIO when the sole listed portfolio has a different id', async () => {
    const { ipc } = await run(scripted(consistentAttempt()));
    expect(JSON.stringify(ipc.sent)).not.toContain('DEFAULT_PORTFOLIO');
  });

  it('accepts an operator-selected id only when it is exactly one of the listed portfolios', async () => {
    const listed = [summaryRow({ portfolioId: OTHER_PORTFOLIO_ID }), summaryRow()];
    const { result, ipc } = await run(
      scripted(consistentAttempt({ 0: success('portfolio.list', listed) })),
      { portfolioId: PORTFOLIO_ID },
    );

    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    expect(result.accepted?.selectionMethod).toBe('OPERATOR_SELECTED_AND_LISTED');
    expect(ipc.sent[1].payload).toEqual({ portfolioId: PORTFOLIO_ID });
  });

  it('refuses an operator-selected id that IPD did not list, without reading it', async () => {
    const { result, ipc } = await run(scripted([success('portfolio.list', [summaryRow()])]), {
      portfolioId: 'NOT-LISTED-ID',
    });

    expect(result.outcome).toBe('AMBIGUOUS_OR_MISSING_PORTFOLIO');
    expect(result.reasonCode).toBe('SELECTED_PORTFOLIO_NOT_LISTED');
    expect(operations(ipc)).toEqual(['portfolio.list']);
    expect(JSON.stringify(ipc.sent)).not.toContain('NOT-LISTED-ID');
  });
});

describe('connection failure and timeout', () => {
  it('reports a transport fault as IPC_CONNECTION_FAILURE and does not retry', async () => {
    const { result, ipc, sleeps } = await run(scripted([unknownOutcome('portfolio.list', 'TRANSPORT_FAULT')]));

    expect(result.outcome).toBe('IPC_CONNECTION_FAILURE');
    expect(result.reasonCode).toBe('TRANSPORT_FAULT');
    expect(result.exitCode).toBe(10);
    expect(ipc.sent).toHaveLength(1);
    expect(result.attempts).toHaveLength(1);
    expect(sleeps).toEqual([]);
    expect(result.message).toContain('never starts IPD');
  });

  it('reports a timeout as IPC_CONNECTION_FAILURE with its own reason', async () => {
    const { result, ipc } = await run(scripted([unknownOutcome('portfolio.list', 'TIMEOUT')]));

    expect(result.outcome).toBe('IPC_CONNECTION_FAILURE');
    expect(result.reasonCode).toBe('TIMEOUT');
    expect(result.exitCode).toBe(10);
    expect(ipc.sent).toHaveLength(1);
  });

  it('reports a failure in the middle of the sequence and keeps nothing', async () => {
    const { result, ipc } = await run(
      scripted(consistentAttempt({ 2: unknownOutcome('portfolio.revisions', 'TIMEOUT') }).slice(0, 3)),
    );

    expect(result.outcome).toBe('IPC_CONNECTION_FAILURE');
    expect(result.attempts[0].failedOperation).toBe('portfolio.revisions');
    expect(operations(ipc)).toEqual(['portfolio.list', 'portfolio.get', 'portfolio.revisions']);
    expect(result.accepted).toBeNull();
  });
});

describe('binding and authorization refusal', () => {
  it('reports a zero-byte close (Class P) as a refusal and invents no reason', async () => {
    const { result, ipc } = await run(scripted([CLASS_P]));

    expect(result.outcome).toBe('BINDING_OR_AUTHORIZATION_REFUSAL');
    expect(result.reasonCode).toBe('CLASS_P_ZERO_BYTE_CLOSE');
    expect(result.exitCode).toBe(11);
    expect(ipc.sent).toHaveLength(1);
    expect(result.message).toContain('discloses no reason');
  });

  it('makes no IPC call when the IRR-local binding precondition is not affirmed', async () => {
    const { result, ipc } = await run(scripted(consistentAttempt()), {
      env: { IIPS_G2_IPC_ENDPOINT: '/tmp/iips-w11-dep1-mock.sock' },
    });

    expect(result.outcome).toBe('CONFIGURATION_INVALID');
    expect(result.reasonCode).toBe('BINDING_PRECONDITION_NOT_AFFIRMED');
    expect(result.exitCode).toBe(2);
    expect(ipc.sent).toHaveLength(0);
  });

  it('makes no IPC call when the endpoint is not configured', async () => {
    const { result, ipc } = await run(scripted(consistentAttempt()), {
      env: { [BINDING_PRECONDITION_SETTING]: 'true' },
    });

    expect(result.outcome).toBe('CONFIGURATION_INVALID');
    expect(result.reasonCode).toBe('ENDPOINT_NOT_CONFIGURED');
    expect(ipc.sent).toHaveLength(0);
  });

  it('refuses a network-shaped endpoint with the consumer’s own rule', () => {
    const assessment = validateCaptureConfiguration(
      { IIPS_G2_IPC_ENDPOINT: 'http://127.0.0.1:9000', [BINDING_PRECONDITION_SETTING]: '1' },
      'win32',
    );
    expect(assessment.ok).toBe(false);
    expect(assessment.problems.map((problem) => problem.code)).toEqual(['ENDPOINT_NOT_CONFIGURED']);
    expect(JSON.stringify(assessment)).not.toContain('127.0.0.1');
  });

  it('accepts a Windows named pipe and reports kind and source only, never the path', () => {
    const assessment = validateCaptureConfiguration(
      { IIPS_G2_IPC_ENDPOINT: '\\\\.\\pipe\\iips-sentinel-pipe', [BINDING_PRECONDITION_SETTING]: 'yes' },
      'win32',
    );
    expect(assessment.ok).toBe(true);
    expect(assessment.endpoint).toEqual({ kind: 'windows-named-pipe', source: 'absolute-path' });
    expect(JSON.stringify(assessment)).not.toContain('iips-sentinel-pipe');
  });

  it('reports a typed Class A refusal as an unavailable capability', async () => {
    for (const outcome of ['UNAVAILABLE', 'INVALID_REQUEST', 'WRITE_NOT_AUTHORIZED'] as const) {
      const { result } = await run(scripted([classA('portfolio.list', outcome)]));
      expect(result.outcome).toBe('PROTOCOL_CAPABILITY_UNAVAILABLE');
      expect(result.reasonCode).toBe(`CLASS_A_${outcome}`);
      expect(result.exitCode).toBe(14);
      expect(result.message).not.toContain('SENTINEL-SERVER-DETAIL');
    }
  });
});

describe('missing and malformed responses — refused, never repaired', () => {
  const cases: ReadonlyArray<readonly [string, IpcCallResult[], IpcOperation]> = [
    ['a list result that is not an array', [success('portfolio.list', { portfolios: [] })], 'portfolio.list'],
    ['a list row without provenanceDigest', [success('portfolio.list', [{ ...summaryRow(), provenanceDigest: undefined }])], 'portfolio.list'],
    ['a null detail', consistentAttempt({ 1: success('portfolio.get', null) }).slice(0, 2), 'portfolio.get'],
    [
      'a detail without a holdings array',
      consistentAttempt({ 1: success('portfolio.get', { ...detail(), holdings: undefined }) }).slice(0, 2),
      'portfolio.get',
    ],
    [
      'a detail with a non-integer revision',
      consistentAttempt({ 1: success('portfolio.get', { ...detail(), revision: '3' }) }).slice(0, 2),
      'portfolio.get',
    ],
    [
      'a detail carrying governed contributions the consumer does not admit',
      consistentAttempt({ 1: success('portfolio.get', { ...detail(), contributions: [{ contributionId: 'x' }] }) }).slice(0, 2),
      'portfolio.get',
    ],
    [
      'a revisions result that is not an array',
      consistentAttempt({ 2: success('portfolio.revisions', {}) }).slice(0, 3),
      'portfolio.revisions',
    ],
    [
      'a revision row without holdingsCount',
      consistentAttempt({ 2: success('portfolio.revisions', [{ ...revisionRow(), holdingsCount: undefined }]) }).slice(0, 3),
      'portfolio.revisions',
    ],
    [
      'a malformed second detail',
      consistentAttempt({ 3: success('portfolio.get', { ...detail(), isSaved: 'yes' }) }),
      'portfolio.get',
    ],
  ];

  for (const [name, responses, failedOperation] of cases) {
    it(`refuses ${name}`, async () => {
      const { result, ipc } = await run(scripted(responses));

      expect(result.outcome).toBe('PROTOCOL_CAPABILITY_UNAVAILABLE');
      expect(result.reasonCode).toBe('RESPONSE_NOT_ADMITTED_BY_IRR_CONSUMER');
      expect(result.exitCode).toBe(14);
      expect(result.attempts).toHaveLength(1);
      expect(result.attempts[0].failedOperation).toBe(failedOperation);
      expect(result.accepted).toBeNull();
      expect(ipc.sent).toHaveLength(responses.length);
      expectNoSentinel(result.message);
    });
  }
});

describe('consistency checks — an inconsistent attempt is discarded whole', () => {
  async function inconsistent(replacements: Partial<Record<number, IpcCallResult>>) {
    const attempt = consistentAttempt(replacements);
    return run(scripted(attempt, attempt, attempt), { maxAttempts: 3 });
  }

  it('rejects a revision mismatch between the two gets', async () => {
    const { result, ipc } = await inconsistent({ 3: success('portfolio.get', detail({ revision: 4 })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.exitCode).toBe(13);
    expect(result.attempts).toHaveLength(3);
    expect(result.attempts[0].failedCheckIds).toContain('GETS_SAME_REVISION');
    expect(ipc.sent).toHaveLength(12);
    expect(result.accepted).toBeNull();
  });

  it('rejects a provenanceDigest mismatch between the two gets', async () => {
    const { result } = await inconsistent({ 3: success('portfolio.get', detail({ provenanceDigest: OTHER_DIGEST })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('GETS_SAME_PROVENANCE_DIGEST');
    expect(result.attempts[0].failedCheckIds).not.toContain('GETS_SAME_REVISION');
  });

  it('rejects a get that answers for a different portfolio', async () => {
    const { result } = await inconsistent({ 3: success('portfolio.get', detail({ portfolioId: OTHER_PORTFOLIO_ID })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('GETS_NAME_THE_IDENTIFIED_PORTFOLIO');
  });

  it('rejects a history with no entry for the captured revision', async () => {
    const { result } = await inconsistent({ 2: success('portfolio.revisions', [olderRevisionRow()]) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION');
  });

  it('rejects an empty history', async () => {
    const { result } = await inconsistent({ 2: success('portfolio.revisions', []) });
    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION');
  });

  it('rejects a history with two entries for the captured revision', async () => {
    const { result } = await inconsistent({ 2: success('portfolio.revisions', [revisionRow(), revisionRow()]) });
    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION');
  });

  it('rejects a matching history entry whose provenanceDigest differs', async () => {
    const { result } = await inconsistent({
      2: success('portfolio.revisions', [revisionRow({ provenanceDigest: OTHER_DIGEST })]),
    });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toEqual(['HISTORY_ENTRY_SAME_PROVENANCE_DIGEST']);
  });

  it('rejects a history holdingsCount that differs from the holdings array length', async () => {
    const { result } = await inconsistent({ 2: success('portfolio.revisions', [revisionRow({ holdingsCount: 64 })]) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toEqual(['HISTORY_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH']);
  });

  it('rejects a detail holdingsCount that differs from the holdings array length', async () => {
    const short = detail({ holdingsCount: 3 });
    const { result } = await inconsistent({ 1: success('portfolio.get', short), 3: success('portfolio.get', detail({ holdingsCount: 3 })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('DETAIL_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH');
  });

  it('rejects holdings that differ between the two gets at the same revision and digest', async () => {
    const changed = holdingA();
    changed.quantity = 11;
    const { result } = await inconsistent({ 3: success('portfolio.get', detail({ holdings: [changed, holdingB()] })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('HOLDINGS_IDENTICAL_ACROSS_GETS');
    expect(result.attempts[0].failedCheckIds).not.toContain('HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS');
  });

  it('rejects a securityIdentity that differs between the two gets', async () => {
    const unresolved = holdingA();
    unresolved.securityIdentity = null;
    const { result } = await inconsistent({ 3: success('portfolio.get', detail({ holdings: [unresolved, holdingB()] })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toContain('HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS');
  });

  it('rejects any other field that differs between the two details', async () => {
    const { result } = await inconsistent({ 3: success('portfolio.get', detail({ extra: { importEvidence: [] } })) });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.attempts[0].failedCheckIds).toEqual(['DETAIL_IDENTICAL_ACROSS_GETS']);
  });

  it('accepts the same holdings in a different order, and reports the reordering', async () => {
    const { result } = await run(
      scripted(consistentAttempt({ 3: success('portfolio.get', detail({ holdings: [holdingB(), holdingA()] })) })),
    );

    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    const order = result.accepted?.consistency.observations.find((item) => item.id === 'HOLDINGS_ORDER_IDENTICAL_ACROSS_GETS');
    expect(order?.value).toBe(false);
  });

  it('treats a portfolio that disappears after being listed as an inconsistent read', async () => {
    const attempt = consistentAttempt({ 1: classA('portfolio.get', 'RESOURCE_UNAVAILABLE') }).slice(0, 2);
    const { result, ipc } = await run(scripted(attempt, attempt), { maxAttempts: 2 });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.reasonCode).toBe('PORTFOLIO_UNAVAILABLE_AFTER_LISTING');
    expect(result.attempts).toHaveLength(2);
    expect(ipc.sent).toHaveLength(4);
  });

  it('flags an empty provenanceDigest instead of passing it off as a meaningful match', async () => {
    const empty = { provenanceDigest: '' };
    const { result } = await run(
      scripted([
        success('portfolio.list', [summaryRow(empty)]),
        success('portfolio.get', detail(empty)),
        success('portfolio.revisions', [revisionRow(empty)]),
        success('portfolio.get', detail(empty)),
      ]),
    );

    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    const summary = buildSanitizedSummary(result, {}, { written: false, fileName: null, sha256: null, bytes: null });
    expect((summary.portfolio as Record<string, unknown>).provenanceDigestPresent).toBe(false);
    expect((summary.caveats as string[]).some((caveat) => caveat.startsWith('PROVENANCE_DIGEST_NON_EMPTY is false'))).toBe(true);
  });
});

describe('bounded recapture — repeat the whole sequence, never combine reads', () => {
  const ATTEMPT_ONE_ONLY = 'SENTINEL-ATTEMPT-ONE-ONLY';

  it('discards an inconsistent first attempt and accepts a consistent second one, whole', async () => {
    const stale = holdingA();
    stale.symbol = ATTEMPT_ONE_ONLY;
    const first = consistentAttempt({
      1: success('portfolio.get', detail({ revision: 2, holdings: [stale, holdingB()] })),
    });
    const { result, ipc, sleeps } = await run(scripted(first, consistentAttempt()), { retryDelayMs: 250 });

    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    expect(result.attempts.map((attempt) => attempt.outcome)).toEqual(['INCONSISTENT_READ', 'CONSISTENT_CAPTURE']);
    expect(sleeps).toEqual([250]);
    // The full sequence ran twice: list included, both times.
    expect(operations(ipc)).toEqual([...CAPTURE_REQUEST_SEQUENCE, ...CAPTURE_REQUEST_SEQUENCE]);

    // Nothing of the discarded attempt survives into the exact capture.
    const exact = JSON.stringify(buildExactCaptureDocument(result, {}));
    expect(exact).not.toContain(ATTEMPT_ONE_ONLY);
    expect(result.accepted?.calls).toHaveLength(4);
    expect(result.accepted?.firstView.revision).toBe(3);
    expect(result.accepted?.secondView.revision).toBe(3);
  });

  it('stops after the bound and produces no capture', async () => {
    const bad = consistentAttempt({ 3: success('portfolio.get', detail({ revision: 4 })) });
    const { result, ipc, sleeps } = await run(scripted(bad, bad), { maxAttempts: 2, retryDelayMs: 100 });

    expect(result.outcome).toBe('INCONSISTENT_READ');
    expect(result.exitCode).toBe(13);
    expect(result.attempts).toHaveLength(2);
    expect(ipc.sent).toHaveLength(8);
    // One delay between two attempts; none after the last.
    expect(sleeps).toEqual([100]);
    expect(result.accepted).toBeNull();
  });

  it('never exceeds the hard attempt limit, whatever is requested', async () => {
    const bad = consistentAttempt({ 3: success('portfolio.get', detail({ revision: 4 })) });
    const { result, ipc } = await run(scripted(...Array.from({ length: 50 }, () => bad)), {
      maxAttempts: 50,
      retryDelayMs: 0,
    });

    expect(result.maxAttempts).toBe(MAX_ATTEMPTS_LIMIT);
    expect(result.attempts).toHaveLength(MAX_ATTEMPTS_LIMIT);
    expect(ipc.sent).toHaveLength(MAX_ATTEMPTS_LIMIT * 4);
  });

  it('does not repeat a failure that is not an inconsistency', async () => {
    const { result, ipc } = await run(scripted([CLASS_P]), { maxAttempts: 5 });
    expect(result.attempts).toHaveLength(1);
    expect(ipc.sent).toHaveLength(1);
  });
});

describe('sanitization — the summary and the console carry no portfolio content', () => {
  const NO_EXACT = { written: true, fileName: 'exact-owner-bound-portfolio-capture.json', sha256: 'e'.repeat(64), bytes: 1 };

  it('keeps every sensitive value out of the sanitized summary of a consistent capture', async () => {
    const { result } = await run(scripted(consistentAttempt()));
    const summary = buildSanitizedSummary(result, { irrCommit: 'a835d4af019ab4f677ab238ec42d44326f06a771' }, NO_EXACT);
    const text = JSON.stringify(summary);

    expectNoSentinel(text);
    expect(text).not.toContain('SENTINEL');
    expect(text).not.toContain(VALID_ENV.IIPS_G2_IPC_ENDPOINT as string);
    expect(summary.artifactClass).toBe('SANITIZED_SUMMARY');
    expect(String(summary.notice)).toContain('NOT the complete capture evidence');
    // What it DOES carry: counts, consistency results, revision numbers.
    const portfolio = summary.portfolio as Record<string, unknown>;
    expect(portfolio.revision).toBe(3);
    expect(portfolio.holdingsArrayLength).toBe(2);
    expect(portfolio.holdingsCountReported).toBe(2);
    expect(portfolio.provenanceDigestPresent).toBe(true);
    expect(portfolio.importEvidenceCount).toBe(1);
    expect(portfolio.detailWireShape).toBe('LocalPortfolioDetail');
    expect((summary.consistency as Record<string, unknown>).consistent).toBe(true);
    expect((summary.exactCapture as Record<string, unknown>).sha256).toBe('e'.repeat(64));
  });

  it('exposes only the fixed top-level keys', async () => {
    const { result } = await run(scripted(consistentAttempt()));
    const summary = buildSanitizedSummary(result, {}, NO_EXACT);
    expect(Object.keys(summary).sort()).toEqual(
      [
        'artifactClass', 'attempts', 'build', 'captureId', 'caveats', 'configuration', 'consistency',
        'consumerObservation', 'evidenceEligibility', 'exactCapture', 'exitCode', 'identity', 'limitations',
        'message', 'notice', 'outcome', 'ownerContext', 'peerAuthenticity', 'portfolio', 'protocol', 'readOnly',
        'reasonCode', 'requestSequence', 'schema', 'selection',
      ].sort(),
    );
  });

  it('keeps every sensitive value out of the summary of each failure outcome', async () => {
    const failures: IpcCallResult[][] = [
      [CLASS_P],
      [unknownOutcome('portfolio.list', 'TIMEOUT')],
      [success('portfolio.list', [summaryRow(), summaryRow({ portfolioId: OTHER_PORTFOLIO_ID })])],
      consistentAttempt({ 3: success('portfolio.get', detail({ provenanceDigest: OTHER_DIGEST })) }),
      consistentAttempt({ 1: success('portfolio.get', { ...detail(), holdings: undefined }) }).slice(0, 2),
    ];
    for (const responses of failures) {
      const { result, progress } = await run(scripted(responses), { maxAttempts: 1 });
      expect(result.outcome).not.toBe('CONSISTENT_CAPTURE');
      const text = JSON.stringify(buildSanitizedSummary(result, {}, { written: false, fileName: null, sha256: null, bytes: null }));
      expectNoSentinel(text);
      expectNoSentinel(progress.join('\n'));
      expectNoSentinel(result.message);
    }
  });

  it('keeps every sensitive value out of the progress lines', async () => {
    const { progress } = await run(scripted(consistentAttempt()));
    expect(progress.length).toBeGreaterThan(6);
    expectNoSentinel(progress.join('\n'));
  });

  it('drops host build metadata that is not shaped like a commit, a label or an instant', async () => {
    const { result } = await run(scripted(consistentAttempt()));
    const summary = buildSanitizedSummary(
      result,
      {
        irrCommit: 'C:\\Users\\someone\\secret',
        ipdCheckoutCommit: 'not a commit; rm -rf',
        ipdCheckoutSource: 'C:\\Users\\someone',
        ipdEntrypointLastWriteUtc: 'yesterday',
      },
      NO_EXACT,
    );
    const build = summary.build as Record<string, any>;
    expect(build.irr.commit).toBeNull();
    expect(build.ipdHostObserved.checkoutCommit).toBeNull();
    expect(build.ipdHostObserved.checkoutSource).toBeNull();
    expect(build.ipdHostObserved.entrypointLastWriteUtc).toBeNull();
    expect(JSON.stringify(summary)).not.toContain('someone');
  });

  it('marks a capture of the synthetic test peer as not evidence', async () => {
    const id = `${SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX}-PORTFOLIO`;
    const { result } = await run(
      scripted([
        success('portfolio.list', [summaryRow({ portfolioId: id })]),
        success('portfolio.get', detail({ portfolioId: id })),
        success('portfolio.revisions', [revisionRow()]),
        success('portfolio.get', detail({ portfolioId: id })),
      ]),
    );
    const summary = buildSanitizedSummary(result, {}, NO_EXACT);
    expect(summary.evidenceEligibility).toBe('NOT_EVIDENCE_SYNTHETIC_TEST_PEER');
    expect((summary.caveats as string[])[0]).toContain('SYNTHETIC TEST PEER');
  });
});

describe('holding identity — from the actual securityIdentity object only', () => {
  it('counts resolved, explicitly-null, absent and malformed identities without deriving anything', () => {
    const absent = holdingB();
    delete absent.securityIdentity;
    const malformed = { ...holdingA(), securityIdentity: SECURITY_ID_A };
    const partial = { ...holdingA(), securityIdentity: { securityId: SECURITY_ID_A } };
    // A symbol that looks exactly like an ISIN, with NO securityIdentity: it must stay unresolved.
    const isinLookingSymbol = { ...holdingB(), symbol: 'ZZ000A000001', securityIdentity: null };

    const aggregate = summarizeHoldingIdentity([holdingA(), holdingB(), absent, malformed, partial, isinLookingSymbol]);

    expect(aggregate.holdings).toBe(6);
    expect(aggregate.securityIdentityObjectPresent).toBe(1);
    expect(aggregate.securityIdentityNull).toBe(2);
    expect(aggregate.securityIdentityAbsent).toBe(1);
    expect(aggregate.securityIdentityMalformed).toBe(2);
    expect(aggregate.identityStatus).toEqual({ RESOLVED: 3, UNRESOLVED: 3 });
    expect(JSON.stringify(aggregate)).not.toContain('ZZ000A000001');
  });

  it('buckets an unknown wire vocabulary value instead of echoing it', () => {
    const odd = { ...holdingA(), identityStatus: 'SENTINEL-STATUS', resolutionDisposition: undefined };
    const aggregate = summarizeHoldingIdentity([odd]);
    expect(aggregate.identityStatus).toEqual({ OTHER: 1 });
    expect(aggregate.resolutionDisposition).toEqual({ ABSENT: 1 });
    expect(JSON.stringify(aggregate)).not.toContain('SENTINEL-STATUS');
  });
});

describe('read-only — no write, no service start, no migration', () => {
  it('sends nothing but the three admitted read operations, in every scenario above', async () => {
    const scenarios: IpcCallResult[][] = [
      consistentAttempt(),
      [CLASS_P],
      [success('portfolio.list', [])],
      consistentAttempt({ 3: success('portfolio.get', detail({ revision: 4 })) }),
    ];
    for (const responses of scenarios) {
      const { ipc } = await run(scripted(responses), { maxAttempts: 1 });
      for (const op of operations(ipc)) {
        expect(IPC_READ_OPERATIONS).toContain(op);
        expect(IPC_WRITE_OPERATIONS).not.toContain(op);
      }
    }
  });

  it('refuses every write operation at the transport guard, before the IPC is touched', async () => {
    let innerCalls = 0;
    const recording = createRecordingReadOnlyTransport(async () => {
      innerCalls += 1;
      return CLASS_P;
    }, () => new Date(0));

    for (const op of IPC_WRITE_OPERATIONS) {
      await expect(recording.transport(op, { portfolioId: 'x' })).rejects.toBeInstanceOf(CaptureReadOnlyViolation);
    }
    await expect(recording.transport('portfolio.analytics' as IpcOperation, undefined)).rejects.toBeInstanceOf(
      CaptureReadOnlyViolation,
    );
    expect(innerCalls).toBe(0);
    expect(recording.calls).toHaveLength(0);
  });

  it('does not modify the environment it is given', async () => {
    const env = { ...VALID_ENV };
    const before = JSON.stringify(env);
    await run(scripted(consistentAttempt()), { env });
    expect(JSON.stringify(env)).toBe(before);
  });

  it('contains no process launcher, database driver, write operation or environment write in its source', () => {
    for (const file of ['./ownerBoundPortfolioCapture.ts', './capture-owner-bound-portfolio.ts']) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      // No way to start, stop or migrate a service, and no second path to persistence.
      expect(source).not.toMatch(/child_process|\bspawn\b|\bexecFile\b|\bexecSync\b|\bfork\(/);
      expect(source).not.toMatch(/sqlite|better-sqlite3|node:sqlite|\.db['"`]/i);
      expect(source).not.toMatch(/createServer|\.listen\(/);
      // No write operation is named as a string literal.
      expect(source).not.toMatch(/['"`]portfolio\.(create|save|reset|delete|importBroker)['"`]/);
      // The environment is read, never assigned.
      expect(source).not.toMatch(/process\.env\[[^\]]+\]\s*=[^=]|process\.env\.\w+\s*=[^=]|delete process\.env/);
      // The synthetic test peer is never imported by the utility.
      expect(source).not.toMatch(/syntheticIpcPeer|run-synthetic-peer/);
    }
  });

  it('builds no frame and no payload of its own: requests come from the existing adapter', () => {
    const source = readFileSync(new URL('./ownerBoundPortfolioCapture.ts', import.meta.url), 'utf8');
    expect(source).toContain("from '../ipcPortAdapter.js'");
    expect(source).toContain('new IpcUserPortfolioPort(');
    expect(source).toMatch(/callIpc\(op, payload, \{ target: resolveIpcEndpoint\(env\) \}\)/);
    expect(source).not.toMatch(/encodeRequestFrame|writeUInt32BE|createConnection|node:net/);
  });
});
