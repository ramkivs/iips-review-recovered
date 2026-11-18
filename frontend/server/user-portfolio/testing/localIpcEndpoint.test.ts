/**
 * TEST INFRASTRUCTURE tests — platform-aware selection of a LOCAL IPC endpoint.
 *
 * WHY THIS FILE EXISTS
 *   The capture CLI's synthetic-peer tests and the Direct P1 integration test used to hard-code a
 *   POSIX `.sock` path. On Windows, `listen` on a filesystem socket path fails with `EACCES`, so
 *   the peer never started — and the teardown then failed a second time trying to close a peer
 *   that did not exist. The endpoint FORM was the incompatibility, not the IPC protocol.
 *
 *   These tests pin the replacement: one helper selects the local endpoint class the production
 *   client already accepts on the platform in use (a Unix-domain socket path on POSIX, a
 *   `\\.\pipe\` name on Windows), and the SAME string is what both sides are handed. The
 *   cross-check against `resolveIpcEndpoint` is the point — an endpoint the client's own resolver
 *   would reject is not a compatibility fix, it is a different failure.
 *
 * NOT EVIDENCE. Nothing here contacts IPD, a vendor, a database or a Windows host: it binds a
 * local test endpoint in this process only.
 *
 * @vitest-environment node
 */
import net from 'node:net';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { IPC_ENDPOINT_SETTING, resolveIpcEndpoint } from '../ipcClient.js';
import {
  createLocalIpcEndpoint,
  localIpcEndpointKindFor,
  WINDOWS_PIPE_PREFIX,
  type LocalIpcEndpoint,
  type LocalIpcEndpointOptions,
} from './localIpcEndpoint.js';

const created: LocalIpcEndpoint[] = [];

function endpoint(options: LocalIpcEndpointOptions): LocalIpcEndpoint {
  const made = createLocalIpcEndpoint(options);
  created.push(made);
  return made;
}

/** How many temporary directories a label has allocated right now — a leak is a failure. */
function temporaryDirectoriesFor(label: string): number {
  return readdirSync(tmpdir()).filter((entry) => entry.startsWith(`iips-${label}-`)).length;
}

afterEach(() => {
  for (const made of created.splice(0)) made.dispose();
});

describe('local IPC endpoint selection', () => {
  it('selects the host platform\'s local endpoint class', () => {
    const made = endpoint({ label: 'ep-host' });
    expect(made.kind).toBe(localIpcEndpointKindFor());

    if (made.kind === 'unix-socket') {
      expect(made.directory).not.toBeNull();
      expect(made.path).toBe(join(made.directory as string, 'peer.sock'));
      expect(existsSync(made.directory as string)).toBe(true);
    } else {
      expect(made.directory).toBeNull();
      expect(made.path.startsWith(WINDOWS_PIPE_PREFIX)).toBe(true);
    }
    // Reserved, not bound: an endpoint nothing listens on is the connection-failure case.
    expect(existsSync(made.path)).toBe(false);
  });

  it('hands the PRODUCTION resolver an endpoint it accepts on the host platform', () => {
    const made = endpoint({ label: 'ep-resolver' });
    const target = resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: made.path });
    expect(target.kind).toBe(made.kind);
    expect(target.path).toBe(made.path);
    expect(target.source).toBe('absolute-path');
  });

  it('selects a Windows named pipe for the Windows platform, which the resolver accepts unchanged', () => {
    const made = endpoint({ label: 'ep-win32', platform: 'win32' });
    expect(made.kind).toBe('windows-named-pipe');
    expect(localIpcEndpointKindFor('win32')).toBe('windows-named-pipe');
    expect(made.path.startsWith(WINDOWS_PIPE_PREFIX)).toBe(true);
    // A pipe NAME, not a path: nothing after the namespace prefix may look like a directory.
    expect(made.path.slice(WINDOWS_PIPE_PREFIX.length)).not.toContain('\\');
    expect(made.path.length).toBeLessThanOrEqual(256);
    expect(made.directory).toBeNull();
    // Disposing a pipe name allocates and removes nothing on any host.
    made.dispose();
    expect(existsSync(made.path)).toBe(false);

    const target = resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: made.path }, 'win32');
    expect(target.kind).toBe('windows-named-pipe');
    expect(target.path).toBe(made.path);
  });

  it('refuses to hand Windows a POSIX socket path, which is exactly the failure being fixed', () => {
    const posixShaped = '/tmp/iips-ep-not-windows/peer.sock';
    expect(() => resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: posixShaped }, 'win32')).toThrow(
      /must be a named pipe/,
    );
  });

  it('never collides: every endpoint carries its own random component', () => {
    const first = endpoint({ label: 'ep-unique' });
    const second = endpoint({ label: 'ep-unique' });
    const third = endpoint({ label: 'ep-unique', name: 'other' });
    expect(new Set([first.path, second.path, third.path]).size).toBe(3);
    if (first.kind === 'unix-socket') {
      expect(new Set([first.directory, second.directory, third.directory]).size).toBe(3);
    }
  });

  it('refuses a label or a name that could escape the endpoint namespace, and allocates nothing', () => {
    const before = temporaryDirectoriesFor('ep-unsafe');
    for (const unsafe of ['../escape', 'a/b', 'a\\b', '', 'with space', 'name;rm']) {
      expect(() => endpoint({ label: unsafe })).toThrow(/letters, digits, dot, underscore and hyphen/);
      expect(() => endpoint({ label: 'ep-unsafe', name: unsafe })).toThrow(
        /letters, digits, dot, underscore and hyphen/,
      );
    }
    expect(temporaryDirectoriesFor('ep-unsafe')).toBe(before);
  });

  it('releases what it allocated, exactly once', () => {
    const made = endpoint({ label: 'ep-dispose' });
    const directory = made.directory;
    made.dispose();
    made.dispose();
    if (directory !== null) expect(existsSync(directory)).toBe(false);
    expect(created).toContain(made); // the afterEach dispose is still safe after an explicit one
  });

  it('refuses an endpoint too long to bind, and leaves no temporary directory behind', () => {
    const before = temporaryDirectoriesFor('ep-toolong');
    const longName = 'n'.repeat(120);
    expect(() => endpoint({ label: 'ep-toolong', name: longName, platform: 'linux' })).toThrow(/POSIX limit/);
    expect(temporaryDirectoriesFor('ep-toolong')).toBe(before);

    // 300 characters of label: the pipe path alone is over the Windows limit before any prefix.
    expect(() => endpoint({ label: 'w'.repeat(300), platform: 'win32' })).toThrow(/256-character limit/);
  });

  it('binds and serves on the selected endpoint — the operation Windows rejected with EACCES', async () => {
    const made = endpoint({ label: 'ep-bind' });
    const live = new Set<net.Socket>();
    const server = net.createServer((socket) => {
      live.add(socket);
      socket.on('close', () => live.delete(socket));
      socket.on('error', () => undefined);
      socket.end('ok');
    });
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error): void => reject(error);
      server.once('error', onError);
      server.listen(made.path, () => {
        server.removeListener('error', onError);
        resolve();
      });
    });

    // Held in a reference object: TypeScript narrows a `let` that is only assigned inside a
    // closure to `null`, which would make the teardown below unreachable to the compiler.
    const client: { socket: net.Socket | null } = { socket: null };
    try {
      const received = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        client.socket = net.createConnection({ path: made.path }, () => client.socket?.write('ping'));
        client.socket.on('data', (chunk: Buffer) => chunks.push(chunk));
        client.socket.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        client.socket.on('error', reject);
      });
      expect(received).toBe('ok');
    } finally {
      // Both sides are destroyed before the server is closed. The production client destroys its
      // socket once it has settled; a server-side socket that already half-closed does NOT go away
      // by itself, and `server.close()` waits for every connection — so an undestroyed socket here
      // would hang the teardown rather than fail the assertion. This is the same reason the
      // synthetic peer tracks its live sockets and destroys them in `close()`.
      client.socket?.destroy();
      for (const socket of live) socket.destroy();
      live.clear();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('selects no port and no fixed name: the CODE mentions neither', () => {
    const raw = readFileSync(new URL('./localIpcEndpoint.ts', import.meta.url), 'utf8');
    // Prose may explain why TCP is rejected; only real code counts, so comments are stripped first.
    const source = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    // No TCP at all: a port would be a new endpoint class the production client rejects, and a
    // hard-coded one would collide with other processes. Uniqueness comes from a random component.
    expect(source).not.toMatch(/\bport\b/i);
    expect(source).not.toMatch(/listen\(/);
    expect(source).toContain('randomUUID()');
  });
});
