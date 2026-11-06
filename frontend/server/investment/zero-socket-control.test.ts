/**
 * AC-X2 — negative control for the instrumentation.
 *
 * A zero is only evidence if the instrument can register a one. This file proves the probe installed by
 * `demo/zeroSocketProbe.ts` actually observes and classifies outbound attempts:
 *
 *   - a connection to a **non-loopback** destination is recorded as EXTERNAL and **refused** (it throws before any
 *     connection is made, so the control performs no external I/O of its own);
 *   - a **loopback** round trip is recorded as LOOPBACK and is allowed to proceed, exercised with a real local server,
 *     which is exactly the permission design §I.2 grants;
 *   - a **listening** socket is recorded as a bind, not as a connection;
 *   - a name lookup is recorded on the `dns` channel (exercised with `localhost`, resolved from the hosts file, so the
 *     control does not perform an external DNS query).
 *
 * Without this file, the passing AC-X2 run would be consistent with an instrument that never fires.
 */
import dgram from 'node:dgram';
import dns from 'node:dns';
import http from 'node:http';
import net from 'node:net';
import tls from 'node:tls';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { installNetworkProbe, type NetworkAttempt } from './demo/zeroSocketProbe';

function findRepoRoot(start: string): string {
  let current = resolve(start);
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(join(current, 'docs', 'integration')) && existsSync(join(current, 'frontend', 'server'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`could not locate the repository root from ${start}`);
}

const RECORD_PATH =
  process.env['AC_X2_CONTROL_RECORD_PATH'] ??
  join(findRepoRoot(process.cwd()), 'evidence', 'iid', 'IID-AC-X2-ZERO-SOCKET-2026-11-06', 'zero-socket-control.json');

describe('AC-X2 — the instrumentation registers what it is supposed to register', () => {
  it('classifies external attempts as EXTERNAL and refuses them; permits and records loopback', async () => {
    // Taken BEFORE the probe is installed, so the control can prove that a reference captured earlier than the
    // instrumentation still cannot open an external connection (the `net.Socket.prototype.connect` backstop).
    const preCapturedConnect = net.connect.bind(net);
    const probe = installNetworkProbe();
    const refusals: string[] = [];
    let loopbackRoundTrip = 'not attempted';

    try {
      // ---- external attempts: refused synchronously, before any connection is made ---------------------------
      const externalAttempts: (readonly [string, () => unknown])[] = [
        ['net.connect', () => net.connect({ host: 'example.com', port: 443 })],
        ['net.createConnection', () => net.createConnection({ host: '203.0.113.10', port: 443 })],
        ['tls.connect', () => tls.connect({ host: 'example.com', port: 443 })],
        ['http.request', () => http.request('http://example.com/')],
        ['https.request', () => http.request({ protocol: 'https:', hostname: 'example.com', path: '/' } as never)],
        ['globalThis.fetch', () => fetch('https://example.com/')],
      ];
      externalAttempts.push([
        'pre-captured net.connect',
        () => preCapturedConnect({ host: 'example.com', port: 443 } as never),
      ] as const);
      for (const [channel, attempt] of externalAttempts) {
        try {
          attempt();
          refusals.push(`${channel}: NOT REFUSED`);
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause);
          refusals.push(`${channel}: refused${message.includes('non-loopback') ? ' (non-loopback)' : ' (unexpected message)'}`);
        }
      }

      // ---- loopback: permitted, and a real local round trip proves the permission is exercised ---------------
      const server = net.createServer((socket) => {
        socket.end('ac-x2-loopback-ok');
      });
      await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : 0;
      loopbackRoundTrip = await new Promise<string>((resolveRoundTrip, rejectRoundTrip) => {
        const socket = net.connect({ host: '127.0.0.1', port });
        let received = '';
        socket.setEncoding('utf8');
        socket.on('data', (chunk: string) => {
          received += chunk;
        });
        socket.on('end', () => resolveRoundTrip(`received "${received.trim()}" over 127.0.0.1:${port}`));
        socket.on('error', rejectRoundTrip);
      });
      await new Promise<void>((resolveClose) => server.close(() => resolveClose()));

      // ---- name lookup on the dns channel, resolved locally ---------------------------------------------------
      const looked = await new Promise<string>((resolveLookup, rejectLookup) => {
        dns.lookup('localhost', (cause, address2) => {
          if (cause !== null) rejectLookup(cause);
          else resolveLookup(address2);
        });
      });

      // ---- a datagram socket is created and closed immediately -------------------------------------------------
      const udp = dgram.createSocket('udp4');
      udp.close();

      const byClass = (kind: NetworkAttempt['classification']): NetworkAttempt[] =>
        probe.attempts.filter((attempt) => attempt.classification === kind);

      const record = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        purpose:
          'negative control for the AC-X2 probe: proves the instrumentation observes, classifies and (for the prohibited case) refuses outbound attempts',
        refusals,
        preCapturedReferenceCaught: byClass('EXTERNAL').some(
          (attempt) => attempt.channel === 'net.Socket.prototype.connect' && attempt.host === 'example.com',
        ),
        loopbackRoundTrip,
        localhostResolvedTo: looked,
        counts: {
          total: probe.attempts.length,
          external: byClass('EXTERNAL').length,
          loopback: byClass('LOOPBACK').length,
          listen: byClass('LISTEN').length,
          ipc: byClass('IPC').length,
          localSocket: byClass('LOCAL_SOCKET').length,
          unresolved: byClass('UNRESOLVED').length,
        },
        attempts: probe.attempts,
      };
      // Best-effort, for the same reason as the main test: the control's assertions must not depend on the filesystem.
      try {
        mkdirSync(dirname(RECORD_PATH), { recursive: true });
        writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
      } catch (cause) {
        // eslint-disable-next-line no-console
        console.warn(`AC-X2 control: could not write ${RECORD_PATH}: ${cause instanceof Error ? cause.message : String(cause)}`);
      }

      // Every external attempt was refused, and every one of them is on the record as EXTERNAL.
      expect(refusals).toEqual([
        'net.connect: refused (non-loopback)',
        'net.createConnection: refused (non-loopback)',
        'tls.connect: refused (non-loopback)',
        'http.request: refused (non-loopback)',
        'https.request: refused (non-loopback)',
        'globalThis.fetch: refused (non-loopback)',
        'pre-captured net.connect: refused (non-loopback)',
      ]);
      expect(byClass('EXTERNAL').length).toBeGreaterThanOrEqual(externalAttempts.length);
      expect(byClass('EXTERNAL').every((attempt) => attempt.host !== null)).toBe(true);
      // The backstop channel saw the pre-captured call with its real destination, not as "no host".
      expect(
        byClass('EXTERNAL').some(
          (attempt) => attempt.channel === 'net.Socket.prototype.connect' && attempt.host === 'example.com',
        ),
      ).toBe(true);

      // Loopback was permitted, observed, and actually worked.
      expect(loopbackRoundTrip).toBe(`received "ac-x2-loopback-ok" over 127.0.0.1:${port}`);
      expect(byClass('LOOPBACK').some((attempt) => attempt.host === '127.0.0.1')).toBe(true);
      expect(byClass('LISTEN').some((attempt) => attempt.host === '127.0.0.1')).toBe(true);
      // A socket with no destination is neither allowed nor forbidden, and is not counted as a connection.
      expect(byClass('LOCAL_SOCKET').some((attempt) => attempt.channel === 'dgram.createSocket')).toBe(true);
      expect(byClass('EXTERNAL').some((attempt) => attempt.channel === 'net.connect')).toBe(true);
      expect(probe.attempts.some((attempt) => attempt.channel.startsWith('dns.'))).toBe(true);
      expect(probe.attempts.some((attempt) => attempt.channel === 'dgram.createSocket')).toBe(true);
    } finally {
      probe.restore();
    }
  }, 30_000);
});
