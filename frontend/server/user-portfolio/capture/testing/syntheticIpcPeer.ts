/**
 * TEST FIXTURE ONLY — a synthetic contract-v1 peer for the capture utility's tests.
 *
 * This is NOT IPD and NOT a substitute for it. It exists so the capture utility can be
 * exercised end to end through the REAL `callIpc` implementation (framing, one request
 * per connection, zero-byte close) without a database, a binding or a Windows host.
 *
 * Everything it serves is fabricated and says so: the portfolio id carries
 * `SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX`, which the utility reports as
 * `NOT_EVIDENCE_SYNTHETIC_TEST_PEER`. A run against this peer is a UTILITY TEST. It is
 * never capture evidence for W11 acceptance dependency 1 and must never be presented
 * as one. The capture utility itself never imports this file.
 */
import net from 'node:net';

import { IPC_LENGTH_PREFIX_BYTES, IPC_PROTOCOL_VERSION } from '../../ipcClient.js';
import { SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX } from '../ownerBoundPortfolioCapture.js';

export const SYNTHETIC_PORTFOLIO_ID = `${SYNTHETIC_FIXTURE_PORTFOLIO_PREFIX}-PORTFOLIO`;

export type SyntheticPeerMode =
  /** Answers every read consistently. */
  | 'CONSISTENT'
  /** Accepts the connection and closes it with zero bytes (Class P). */
  | 'CLASS_P'
  /** The second `portfolio.get` of the FIRST attempt reports a newer revision. */
  | 'FIRST_ATTEMPT_INCONSISTENT';

export interface SyntheticPeer {
  readonly path: string;
  /** Operations received, in order. */
  readonly operations: string[];
  close(): Promise<void>;
}

function syntheticHoldings(): Record<string, unknown>[] {
  return [
    {
      symbol: 'SYNTHETIC-FIXTURE-A',
      companyId: 'SYNTHETIC-FIXTURE-COMPANY-A',
      quantity: 1,
      averageBuyPrice: 1,
      currentPrice: 1,
      marketValue: 1,
      weightPercentage: 50,
      active: true,
      sourceBroker: 'SYNTHETIC-FIXTURE',
      lineageDigest: '',
      identityStatus: 'RESOLVED',
      resolutionDisposition: 'CANONICAL_P04',
      securityIdentity: {
        securityId: 'ISIN:ZZ0000000001:EQ',
        isin: 'ZZ0000000001',
        series: 'EQ',
        isinAuthority: 'NON_AUTHORITATIVE',
      },
    },
    {
      symbol: 'SYNTHETIC-FIXTURE-B',
      companyId: 'SYNTHETIC-FIXTURE-COMPANY-B',
      quantity: 1,
      averageBuyPrice: 1,
      currentPrice: 1,
      marketValue: 1,
      weightPercentage: 50,
      active: true,
      sourceBroker: 'SYNTHETIC-FIXTURE',
      lineageDigest: '',
      identityStatus: 'UNRESOLVED',
      resolutionDisposition: 'MANUAL_PERSONAL_ENTRY',
      securityIdentity: null,
    },
  ];
}

const SYNTHETIC_DIGEST = 'f'.repeat(64);

function syntheticSummary(revision: number): Record<string, unknown> {
  return {
    portfolioId: SYNTHETIC_PORTFOLIO_ID,
    portfolioName: 'Synthetic fixture portfolio (not real data)',
    revision,
    holdingsCount: 2,
    totalMarketValue: 2,
    lastUpdated: '2000-01-01T00:00:00.000Z',
    weightSumPercentage: 100,
    provenanceDigest: SYNTHETIC_DIGEST,
    isSaved: true,
  };
}

function syntheticDetail(revision: number): Record<string, unknown> {
  return { ...syntheticSummary(revision), holdings: syntheticHoldings(), contributions: [], importEvidence: [] };
}

function syntheticRevisions(): Record<string, unknown>[] {
  return [
    {
      revision: 1,
      operation: 'INITIAL',
      committedAt: '2000-01-01T00:00:00.000Z',
      totalMarketValue: 2,
      provenanceDigest: SYNTHETIC_DIGEST,
      holdingsCount: 2,
    },
  ];
}

function frameOf(value: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(value), 'utf8');
  const frame = Buffer.alloc(IPC_LENGTH_PREFIX_BYTES + body.byteLength);
  frame.writeUInt32BE(body.byteLength, 0);
  body.copy(frame, IPC_LENGTH_PREFIX_BYTES);
  return frame;
}

/**
 * Starts the synthetic peer on a local endpoint (a unix socket path, or a Windows
 * named pipe path). It answers the three read operations and nothing else: any other
 * operation is closed with zero bytes.
 */
export function startSyntheticPeer(endpointPath: string, mode: SyntheticPeerMode = 'CONSISTENT'): Promise<SyntheticPeer> {
  return new Promise((resolveStart, rejectStart) => {
    const operations: string[] = [];
    const live = new Set<net.Socket>();
    let getCount = 0;

    const server = net.createServer({ allowHalfOpen: true }, (socket) => {
      live.add(socket);
      socket.on('close', () => live.delete(socket));
      socket.on('error', () => undefined);
      const chunks: Buffer[] = [];
      let answered = false;

      socket.on('data', (chunk: Buffer) => {
        if (answered) return;
        chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES) return;
        const declared = buffer.readUInt32BE(0);
        if (buffer.byteLength < IPC_LENGTH_PREFIX_BYTES + declared) return;
        answered = true;

        let envelope: Record<string, unknown> | null = null;
        try {
          envelope = JSON.parse(
            buffer.subarray(IPC_LENGTH_PREFIX_BYTES, IPC_LENGTH_PREFIX_BYTES + declared).toString('utf8'),
          ) as Record<string, unknown>;
        } catch {
          envelope = null;
        }
        const op = envelope !== null && typeof envelope.op === 'string' ? envelope.op : '(unparseable)';
        operations.push(op);

        if (mode === 'CLASS_P' || envelope === null) {
          socket.end();
          return;
        }

        let result: unknown;
        if (op === 'portfolio.list') {
          result = [syntheticSummary(1)];
        } else if (op === 'portfolio.get') {
          getCount += 1;
          result = syntheticDetail(mode === 'FIRST_ATTEMPT_INCONSISTENT' && getCount === 2 ? 2 : 1);
        } else if (op === 'portfolio.revisions') {
          result = syntheticRevisions();
        } else {
          // Not a read this fixture serves. Zero bytes, like a pre-authorization refusal.
          socket.end();
          return;
        }
        socket.end(frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op, result }));
      });
    });

    server.once('error', rejectStart);
    server.listen(endpointPath, () => {
      resolveStart({
        path: endpointPath,
        operations,
        close: () =>
          new Promise<void>((resolveClose) => {
            for (const socket of live) socket.destroy();
            server.close(() => resolveClose());
          }),
      });
    });
  });
}
