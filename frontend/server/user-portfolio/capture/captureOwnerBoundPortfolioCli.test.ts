/**
 * UTILITY TESTS for the W11 dependency 1 capture CLI.
 *
 * Two groups, both fabricated end to end:
 *   1. MOCKED IPC — output locations, the LOCAL-ONLY / sanitized split, exit codes and
 *      console hygiene.
 *   2. SYNTHETIC PEER over a real local socket — the CLI's DEFAULT transport, i.e. the
 *      existing `callIpc`, with the endpoint taken from the environment exactly as on
 *      the host. The peer is `testing/syntheticIpcPeer.ts`, a test fixture, not IPD.
 *
 * NONE OF THIS IS CAPTURE EVIDENCE. No IPD, no database, no binding and no Windows named
 * pipe is involved. W11 acceptance dependency 1 needs a consistent capture from the
 * Windows host.
 *
 * @vitest-environment node
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { IpcCallResult, IpcOperation } from '../ipcClient.js';
import { BINDING_PRECONDITION_SETTING } from '../ownerContextFromBinding.js';
import {
  assessOutputRoot,
  CANDIDATES_FILE,
  EXACT_CAPTURE_FILE,
  LOCAL_ONLY_DIRECTORY,
  parseCaptureArguments,
  runCaptureCli,
  SANITIZED_DIRECTORY,
  SUMMARY_JSON_FILE,
  SUMMARY_MARKDOWN_FILE,
  type CliResult,
} from './capture-owner-bound-portfolio.js';
import { sha256Hex, type CaptureTransport } from './ownerBoundPortfolioCapture.js';
import { startSyntheticPeer, SYNTHETIC_PORTFOLIO_ID, type SyntheticPeer } from './testing/syntheticIpcPeer.js';

const PORTFOLIO_ID = 'SENTINEL-CLI-PORTFOLIO-ID';
const SECOND_ID = 'SENTINEL-CLI-SECOND-ID';
const SYMBOL = 'SENTINELCLISYM';
const DIGEST = `${'12'.repeat(28)}5e471e1d`;
const SENTINELS = [PORTFOLIO_ID, SECOND_ID, SYMBOL, DIGEST, 'SENTINEL-CLI-NAME', 'ISIN:IN5E47INEL77:EQ'];

function summaryRow(portfolioId = PORTFOLIO_ID, revision = 1): Record<string, unknown> {
  return {
    portfolioId,
    portfolioName: 'SENTINEL-CLI-NAME',
    revision,
    holdingsCount: 1,
    totalMarketValue: 4242.42,
    lastUpdated: '2026-11-02T00:00:00.000Z',
    weightSumPercentage: 100,
    provenanceDigest: DIGEST,
    isSaved: false,
  };
}

function detail(revision = 1): Record<string, unknown> {
  return {
    ...summaryRow(PORTFOLIO_ID, revision),
    holdings: [
      {
        symbol: SYMBOL,
        companyId: 'SENTINEL-CLI-COMPANY',
        quantity: 1,
        averageBuyPrice: 1,
        currentPrice: 1,
        marketValue: 4242.42,
        weightPercentage: 100,
        active: true,
        sourceBroker: 'SENTINEL-CLI-BROKER',
        lineageDigest: '',
        identityStatus: 'RESOLVED',
        resolutionDisposition: 'CANONICAL_P04',
        securityIdentity: {
          securityId: 'ISIN:IN5E47INEL77:EQ',
          isin: 'IN5E47INEL77',
          series: 'EQ',
          isinAuthority: 'NON_AUTHORITATIVE',
        },
      },
    ],
    contributions: [],
    importEvidence: [],
  };
}

const REVISIONS = [
  {
    revision: 1,
    operation: 'INITIAL',
    committedAt: '2026-11-02T00:00:00.000Z',
    totalMarketValue: 4242.42,
    provenanceDigest: DIGEST,
    holdingsCount: 1,
  },
];

function ok(op: IpcOperation, result: unknown): IpcCallResult {
  return { kind: 'SUCCESS', frame: { v: 1, ok: true, op, result }, bytesReceived: 99 };
}

interface Mock {
  readonly transport: CaptureTransport;
  readonly sent: IpcOperation[];
}

function mock(responses: IpcCallResult[]): Mock {
  const sent: IpcOperation[] = [];
  return {
    sent,
    transport: async (op) => {
      sent.push(op);
      const response = responses[sent.length - 1];
      if (response === undefined) throw new Error('no scripted response');
      return response;
    },
  };
}

function consistent(): IpcCallResult[] {
  return [
    ok('portfolio.list', [summaryRow()]),
    ok('portfolio.get', detail()),
    ok('portfolio.revisions', REVISIONS),
    ok('portfolio.get', detail()),
  ];
}

const ENV: NodeJS.ProcessEnv = {
  IIPS_G2_IPC_ENDPOINT: '/tmp/iips-w11-dep1-cli-mock.sock',
  [BINDING_PRECONDITION_SETTING]: 'true',
};

interface Console {
  readonly out: string[];
  readonly err: string[];
  all(): string;
}

function consoleCapture(): Console {
  const out: string[] = [];
  const err: string[] = [];
  return { out, err, all: () => [...out, ...err].join('\n') };
}

let outputRoot: string;

beforeEach(() => {
  outputRoot = mkdtempSync(path.join(tmpdir(), 'iips-w11-dep1-cli-test-'));
});

afterEach(() => {
  rmSync(outputRoot, { recursive: true, force: true });
});

async function runCli(
  argv: string[],
  transport: CaptureTransport | undefined,
  env: NodeJS.ProcessEnv = ENV,
): Promise<{ result: CliResult; io: Console }> {
  const io = consoleCapture();
  const result = await runCaptureCli(argv, {
    env,
    platform: 'linux',
    transport,
    sleep: async () => undefined,
    io: { out: (line) => io.out.push(line), err: (line) => io.err.push(line) },
  });
  return { result, io };
}

function filesUnder(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...filesUnder(full));
    else found.push(full);
  }
  return found.sort();
}

describe('CLI outputs (mocked IPC — utility test, not evidence)', () => {
  it('writes the exact capture LOCAL-ONLY and the sanitized summary separately, and exits zero', async () => {
    const ipc = mock(consistent());
    const { result, io } = await runCli(
      ['--output-root', outputRoot, '--irr-commit', 'a835d4af019ab4f677ab238ec42d44326f06a771', '--irr-dirty', 'false'],
      ipc.transport,
    );

    expect(result.exitCode).toBe(0);
    expect(result.outcome).toBe('CONSISTENT_CAPTURE');
    const run = result.runDirectory as string;
    expect(path.dirname(run)).toBe(outputRoot);

    // Exactly these files, in exactly these two directories.
    expect(filesUnder(run).map((file) => path.relative(run, file).split(path.sep).join('/'))).toEqual(
      [
        `${LOCAL_ONLY_DIRECTORY}/README-LOCAL-ONLY.txt`,
        `${LOCAL_ONLY_DIRECTORY}/${EXACT_CAPTURE_FILE}`,
        'README.txt',
        `${SANITIZED_DIRECTORY}/${SUMMARY_JSON_FILE}`,
        `${SANITIZED_DIRECTORY}/${SUMMARY_MARKDOWN_FILE}`,
      ].sort(),
    );

    // The exact capture holds the contents …
    const exactBytes = readFileSync(result.exactCapturePath as string);
    const exactText = exactBytes.toString('utf8');
    for (const sentinel of SENTINELS.filter((value) => value !== SECOND_ID)) expect(exactText).toContain(sentinel);
    expect(JSON.parse(exactText).classification).toContain('LOCAL-ONLY');

    // … and neither sanitized file holds any of them.
    const summaryText = readFileSync(result.summaryPath as string, 'utf8');
    const markdown = readFileSync(path.join(run, SANITIZED_DIRECTORY, SUMMARY_MARKDOWN_FILE), 'utf8');
    for (const sentinel of SENTINELS) {
      expect(summaryText).not.toContain(sentinel);
      expect(markdown).not.toContain(sentinel);
    }
    expect(summaryText).not.toContain('SENTINEL');
    // No filesystem path of the host leaks into the publishable artifact.
    expect(summaryText).not.toContain(outputRoot);
    expect(markdown).not.toContain(outputRoot);

    const summary = JSON.parse(summaryText);
    expect(summary.outcome).toBe('CONSISTENT_CAPTURE');
    expect(summary.artifactClass).toBe('SANITIZED_SUMMARY');
    expect(markdown).toContain('NOT the complete capture evidence');
    // The summary is bound to the exact file by hash, not by content.
    expect(summary.exactCapture.sha256).toBe(sha256Hex(exactBytes));
    expect(summary.exactCapture.bytes).toBe(exactBytes.byteLength);
    expect(summary.build.irr.commit).toBe('a835d4af019ab4f677ab238ec42d44326f06a771');
    expect(summary.build.irr.workingTreeDirty).toBe(false);

    // The console names the two artifacts and prints no portfolio content.
    for (const sentinel of SENTINELS) expect(io.all()).not.toContain(sentinel);
    expect(io.all()).toContain('LOCAL-ONLY; never publish');
    expect(io.all()).toContain('NOT the complete evidence');
    expect(ipc.sent).toEqual(['portfolio.list', 'portfolio.get', 'portfolio.revisions', 'portfolio.get']);
  });

  it('writes no exact capture and exits non-zero when the read is refused', async () => {
    const ipc = mock([{ kind: 'CLASS_P', bytesReceived: 0, reason: null }]);
    const { result, io } = await runCli(['--output-root', outputRoot], ipc.transport);

    expect(result.exitCode).toBe(11);
    expect(result.outcome).toBe('BINDING_OR_AUTHORIZATION_REFUSAL');
    expect(result.exactCapturePath).toBeNull();
    expect(existsSync(path.join(result.runDirectory as string, LOCAL_ONLY_DIRECTORY, EXACT_CAPTURE_FILE))).toBe(false);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.outcome).toBe('BINDING_OR_AUTHORIZATION_REFUSAL');
    expect(summary.evidenceEligibility).toBe('NO_CAPTURE');
    expect(summary.portfolio).toBeNull();
    expect(summary.exactCapture.written).toBe(false);
    expect(io.err.join('\n')).toContain('Nothing synthetic was substituted');
  });

  it('writes no exact capture and exits 13 when every bounded attempt is inconsistent', async () => {
    const bad = [...consistent().slice(0, 3), ok('portfolio.get', detail(2))];
    const ipc = mock([...bad, ...bad]);
    const { result } = await runCli(['--output-root', outputRoot, '--max-attempts', '2', '--retry-delay-ms', '0'], ipc.transport);

    expect(result.exitCode).toBe(13);
    expect(result.exactCapturePath).toBeNull();
    expect(ipc.sent).toHaveLength(8);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.attempts.made).toBe(2);
    expect(summary.attempts.perAttempt[0].failedCheckIds).toContain('GETS_SAME_REVISION');
  });

  it('puts the candidate ids in a LOCAL-ONLY file — not on the console, not in the summary', async () => {
    const ipc = mock([ok('portfolio.list', [summaryRow(PORTFOLIO_ID), summaryRow(SECOND_ID)])]);
    const { result, io } = await runCli(['--output-root', outputRoot], ipc.transport);

    expect(result.exitCode).toBe(12);
    expect(result.candidatesPath).toBe(path.join(result.runDirectory as string, LOCAL_ONLY_DIRECTORY, CANDIDATES_FILE));
    const candidates = JSON.parse(readFileSync(result.candidatesPath as string, 'utf8'));
    expect(candidates.candidates.map((candidate: { portfolioId: string }) => candidate.portfolioId)).toEqual([
      PORTFOLIO_ID,
      SECOND_ID,
    ]);
    const summaryText = readFileSync(result.summaryPath as string, 'utf8');
    for (const sentinel of SENTINELS) {
      expect(summaryText).not.toContain(sentinel);
      expect(io.all()).not.toContain(sentinel);
    }
    expect(JSON.parse(summaryText).selection.listedPortfolioCount).toBe(2);
    expect(ipc.sent).toEqual(['portfolio.list']);
  });

  it('captures the operator-selected portfolio without echoing the id', async () => {
    const responses = consistent();
    responses[0] = ok('portfolio.list', [summaryRow(SECOND_ID), summaryRow(PORTFOLIO_ID)]);
    const { result, io } = await runCli(['--output-root', outputRoot, '--portfolio-id', PORTFOLIO_ID], mock(responses).transport);

    expect(result.exitCode).toBe(0);
    expect(io.all()).not.toContain(PORTFOLIO_ID);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.selection.method).toBe('OPERATOR_SELECTED_AND_LISTED');
    expect(summary.selection.operatorSuppliedPortfolioId).toBe(true);
  });

  it('never overwrites: two runs produce two run directories', async () => {
    const first = await runCli(['--output-root', outputRoot], mock(consistent()).transport);
    const second = await runCli(['--output-root', outputRoot], mock(consistent()).transport);

    expect(first.result.runDirectory).not.toBe(second.result.runDirectory);
    expect(readdirSync(outputRoot)).toHaveLength(2);
  });
});

describe('CLI validation — before any connection', () => {
  it('refuses a missing, relative or in-repository output root and makes no call', async () => {
    const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    expect(existsSync(path.join(repositoryRoot, '.git'))).toBe(true);
    const insideRepository = path.join(repositoryRoot, 'tools', 'windows', 'captures');

    for (const argv of [[], ['--output-root', 'relative/dir'], ['--output-root', insideRepository]]) {
      const ipc = mock(consistent());
      const { result, io } = await runCli(argv, ipc.transport);
      expect(result.exitCode).toBe(2);
      expect(result.outcome).toBe('CONFIGURATION_INVALID');
      expect(result.runDirectory).toBeNull();
      expect(ipc.sent).toHaveLength(0);
      expect(io.err.join('\n')).toContain('No IPC connection was attempted');
    }
    expect(existsSync(insideRepository)).toBe(false);
  });

  it('refuses an output root nested in any git working tree', () => {
    const fakeRepository = path.join(outputRoot, 'some-repo');
    mkdirSync(path.join(fakeRepository, '.git'), { recursive: true });
    expect(assessOutputRoot(path.join(fakeRepository, 'deep', 'er'))).toContain('inside a git working tree');
    expect(assessOutputRoot(path.join(outputRoot, 'elsewhere'))).toBeNull();
  });

  it('is backed by .gitignore entries for the LOCAL-ONLY artifacts, as a second barrier', () => {
    const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
    const ignored = readFileSync(path.join(repositoryRoot, '.gitignore'), 'utf8').split(/\r?\n/);
    expect(ignored).toContain(`${LOCAL_ONLY_DIRECTORY}/`);
    expect(ignored).toContain(EXACT_CAPTURE_FILE);
    expect(ignored).toContain(CANDIDATES_FILE);
  });

  it('refuses an output root that is a file', () => {
    const file = path.join(outputRoot, 'a-file');
    writeFileSync(file, 'x');
    expect(assessOutputRoot(file)).toContain('not a directory');
  });

  it('exits 2 with no call and no output when the configuration is invalid', async () => {
    const ipc = mock(consistent());
    const { result, io } = await runCli(['--output-root', outputRoot, '--validate-only'], ipc.transport, {});

    expect(result.exitCode).toBe(2);
    expect(ipc.sent).toHaveLength(0);
    expect(readdirSync(outputRoot)).toEqual([]);
    expect(io.err.join('\n')).toContain('BINDING_PRECONDITION_NOT_AFFIRMED');
    expect(io.err.join('\n')).toContain('ENDPOINT_NOT_CONFIGURED');
  });

  it('records an invalid configuration in a summary, still without any call', async () => {
    const ipc = mock(consistent());
    const { result } = await runCli(['--output-root', outputRoot], ipc.transport, {
      IIPS_G2_IPC_ENDPOINT: '/tmp/iips-w11-dep1-cli-mock.sock',
    });

    expect(result.exitCode).toBe(2);
    expect(ipc.sent).toHaveLength(0);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.outcome).toBe('CONFIGURATION_INVALID');
    expect(summary.configuration.problems).toEqual([
      { setting: BINDING_PRECONDITION_SETTING, code: 'BINDING_PRECONDITION_NOT_AFFIRMED' },
    ]);
    expect(summary.ownerContext.irrLocalPreconditionAffirmed).toBe(false);
  });

  it('validates only, on request: no call and nothing written', async () => {
    const ipc = mock(consistent());
    const { result } = await runCli(['--output-root', outputRoot, '--validate-only'], ipc.transport);

    expect(result.exitCode).toBe(0);
    expect(result.outcome).toBe('VALIDATION_ONLY_OK');
    expect(ipc.sent).toHaveLength(0);
    expect(readdirSync(outputRoot)).toEqual([]);
  });

  it('rejects bad arguments without echoing their values', () => {
    for (const argv of [
      ['--unknown-SENTINEL-FLAG'],
      ['--max-attempts', '0'],
      ['--max-attempts', '6'],
      ['--max-attempts', 'SENTINEL'],
      ['--retry-delay-ms', '10001'],
      ['--portfolio-id', '   '],
      ['--portfolio-id'],
      ['--irr-dirty', 'SENTINEL'],
      ['--output-root', '/a', '--output-root', '/b'],
    ]) {
      const parsed = parseCaptureArguments(argv);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.error).not.toContain('SENTINEL');
    }
  });
});

describe('CLI over the existing callIpc against the SYNTHETIC test peer (not IPD, not evidence)', () => {
  let socketDirectory: string;
  let peer: SyntheticPeer | null = null;

  beforeEach(() => {
    socketDirectory = mkdtempSync(path.join(tmpdir(), 'iips-w11-dep1-peer-'));
  });

  afterEach(async () => {
    if (peer !== null) await peer.close();
    peer = null;
    rmSync(socketDirectory, { recursive: true, force: true });
  });

  function peerEnvironment(endpoint: string): NodeJS.ProcessEnv {
    return { IIPS_G2_IPC_ENDPOINT: endpoint, [BINDING_PRECONDITION_SETTING]: 'true' };
  }

  it('runs the full sequence through real framing and marks the result as not evidence', async () => {
    const endpoint = path.join(socketDirectory, 'peer.sock');
    peer = await startSyntheticPeer(endpoint);
    // No transport injected: the CLI uses the existing callIpc with the endpoint from the environment.
    const { result } = await runCli(['--output-root', outputRoot], undefined, peerEnvironment(endpoint));

    expect(result.exitCode).toBe(0);
    expect(peer.operations).toEqual(['portfolio.list', 'portfolio.get', 'portfolio.revisions', 'portfolio.get']);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.outcome).toBe('CONSISTENT_CAPTURE');
    expect(summary.evidenceEligibility).toBe('NOT_EVIDENCE_SYNTHETIC_TEST_PEER');
    expect(summary.protocol.responseProtocolVersionsObserved).toEqual([1]);
    expect(summary.identity.securityIdentityObjectPresent).toBe(1);
    expect(summary.identity.securityIdentityNull).toBe(1);
    expect(JSON.stringify(summary)).not.toContain(SYNTHETIC_PORTFOLIO_ID);
    const exact = JSON.parse(readFileSync(result.exactCapturePath as string, 'utf8'));
    expect(exact.selection.portfolioId).toBe(SYNTHETIC_PORTFOLIO_ID);
    expect(exact.evidenceEligibility).toBe('NOT_EVIDENCE_SYNTHETIC_TEST_PEER');
    expect(exact.reads[1].responseBytes).toBeGreaterThan(0);
  });

  it('recaptures once when the first attempt is inconsistent', async () => {
    const endpoint = path.join(socketDirectory, 'peer.sock');
    peer = await startSyntheticPeer(endpoint, 'FIRST_ATTEMPT_INCONSISTENT');
    const { result } = await runCli(['--output-root', outputRoot, '--retry-delay-ms', '0'], undefined, peerEnvironment(endpoint));

    expect(result.exitCode).toBe(0);
    expect(peer.operations).toHaveLength(8);
    const summary = JSON.parse(readFileSync(result.summaryPath as string, 'utf8'));
    expect(summary.attempts.perAttempt.map((attempt: { outcome: string }) => attempt.outcome)).toEqual([
      'INCONSISTENT_READ',
      'CONSISTENT_CAPTURE',
    ]);
  });

  it('reports a zero-byte close as a binding or authorization refusal', async () => {
    const endpoint = path.join(socketDirectory, 'peer.sock');
    peer = await startSyntheticPeer(endpoint, 'CLASS_P');
    const { result } = await runCli(['--output-root', outputRoot], undefined, peerEnvironment(endpoint));

    expect(result.exitCode).toBe(11);
    expect(peer.operations).toEqual(['portfolio.list']);
    expect(result.exactCapturePath).toBeNull();
  });

  it('reports a connection failure when nothing is serving the endpoint, and starts nothing', async () => {
    const endpoint = path.join(socketDirectory, 'nobody-listening.sock');
    const { result } = await runCli(['--output-root', outputRoot], undefined, peerEnvironment(endpoint));

    expect(result.exitCode).toBe(10);
    expect(result.outcome).toBe('IPC_CONNECTION_FAILURE');
    expect(existsSync(endpoint)).toBe(false);
    expect(result.exactCapturePath).toBeNull();
  });
});
