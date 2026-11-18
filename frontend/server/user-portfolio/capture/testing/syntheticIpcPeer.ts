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
import {
  localIpcEndpointKindFor,
  type LocalIpcEndpointKind,
} from '../../testing/localIpcEndpoint.js';
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
  /** The local endpoint class this peer is listening on, for the platform in use. */
  readonly kind: LocalIpcEndpointKind;
  /** Operations received, in order. */
  readonly operations: string[];
  /** Idempotent: closes a started peer exactly once and releases its sockets. */
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
 *
 * `kind` selects the RESPONSE-DELIVERY policy and defaults to the host platform's local endpoint
 * class, which is the same choice the production client makes in `resolveIpcEndpoint`: on POSIX
 * the peer half-closes with the frame, and on Windows it writes the frame and leaves the pipe
 * open, because ending a named pipe triggers the libuv shutdown/forced-break path before the
 * client has read the response (IPD's flush-guard policy, mirrored). A test may state the kind
 * explicitly to exercise that policy on a host whose own class differs.
 *
 * A peer that fails to start is NEVER returned: the promise rejects with the endpoint class and
 * the underlying reason, so a caller cannot close — or report success for — a peer that does not
 * exist.
 */
export function startSyntheticPeer(
  endpointPath: string,
  mode: SyntheticPeerMode = 'CONSISTENT',
  kind: LocalIpcEndpointKind = localIpcEndpointKindFor(),
): Promise<SyntheticPeer> {
  return new Promise((resolveStart, rejectStart) => {
    let settled = false;
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
        const frame = frameOf({ v: IPC_PROTOCOL_VERSION, ok: true, op, result });
        if (kind === 'windows-named-pipe') {
          // Written, and the pipe stays open: the client destroys it once the full frame has
          // arrived. Ending it here would break the pipe before the response is delivered.
          socket.write(frame);
          return;
        }
        socket.end(frame);
      });
    });

    const onStartupError = (error: Error): void => {
      if (settled) return;
      settled = true;
      // Swallow any further error from a server that never listened: rejecting is the report.
      server.removeListener('error', onStartupError);
      server.on('error', () => undefined);
      // The underlying reason is carried in the message: this project compiles against the
      // ES2020 lib, where `Error` takes no `cause` option.
      rejectStart(
        new Error(
          `the synthetic peer could not listen on the ${kind} endpoint '${endpointPath}': `
            + `${error.name}: ${error.message}`,
        ),
      );
    };

    server.once('error', onStartupError);
    server.listen(endpointPath, () => {
      if (settled) return;
      settled = true;
      server.removeListener('error', onStartupError);
      // A started peer stays observable but must not take the run down: socket-level faults are
      // the client's to report, and `close()` destroys every live socket.
      server.on('error', () => undefined);

      let closed = false;
      resolveStart({
        path: endpointPath,
        kind,
        operations,
        close: () =>
          new Promise<void>((resolveClose) => {
            if (closed) {
              resolveClose();
              return;
            }
            closed = true;
            for (const socket of live) socket.destroy();
            live.clear();
            server.close(() => resolveClose());
          }),
      });
    });
  });
}
