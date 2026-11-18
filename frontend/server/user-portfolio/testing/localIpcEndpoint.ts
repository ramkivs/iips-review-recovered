/**
 * TEST INFRASTRUCTURE ONLY — platform-aware selection of a LOCAL IPC endpoint.
 *
 * WHY THIS EXISTS
 *   The IPC contract this repository consumes is a local filesystem endpoint: a Unix-domain
 *   socket path on POSIX, and a Windows named pipe (`\\.\pipe\<name>`) on Windows. The production
 *   client already knows that — `resolveIpcEndpoint` in `../ipcClient.ts` accepts an absolute
 *   POSIX socket path and, on Windows, ONLY a `\\.\pipe\` path, refusing a URL, a `host:port` and
 *   a relative name. Test fixtures that hard-coded a POSIX `.sock` path therefore failed on
 *   Windows at `listen` with `EACCES`: the endpoint form, not the protocol, was incompatible.
 *
 *   This module is the single place a test asks for an endpoint, so the peer that LISTENS and the
 *   client that CONNECTS are handed the same platform-correct string by construction. It changes
 *   no protocol, no framing, no owner-binding rule and no production transport: it selects a
 *   local endpoint the existing client already accepts on the platform it runs on.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *   - No TCP. A loopback port would be a new endpoint class the production client rejects
 *     (`the endpoint setting must not be a host:port`), and it would widen the test's exposure
 *     beyond the local filesystem boundary the contract is defined on.
 *   - No hard-coded port or pipe name. Every endpoint carries a fresh random component, so two
 *     suites — or two runs of one suite — cannot collide with each other or with another process.
 *   - No listening. Creating an endpoint reserves a name; a test that starts nothing on it is
 *     exercising the connection-failure path, which is a required case, not an accident.
 */
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** The two local endpoint classes the production IPC client accepts. */
export type LocalIpcEndpointKind = 'unix-socket' | 'windows-named-pipe';

/** Windows named-pipe namespace. Matches the prefix `resolveIpcEndpoint` requires. */
export const WINDOWS_PIPE_PREFIX = '\\\\.\\pipe\\\\';

/**
 * Linux `sun_path` is 108 bytes; a longer socket path fails at `bind` with a confusing error.
 * Refusing early keeps the failure legible and bounded.
 */
const MAX_POSIX_SOCKET_PATH_LENGTH = 100;

/** Windows pipe paths are limited to 256 characters in total. */
const MAX_WINDOWS_PIPE_PATH_LENGTH = 256;

export interface LocalIpcEndpoint {
  /** Which local endpoint class was selected, for the platform in use. */
  readonly kind: LocalIpcEndpointKind;
  /**
   * The endpoint string. Hand this SAME value to the listening peer and to the client's
   * `IIPS_G2_IPC_ENDPOINT` setting; never derive one from the other.
   */
  readonly path: string;
  /** POSIX only: the temporary directory that owns the socket file. `null` on Windows. */
  readonly directory: string | null;
  /**
   * Release what creating the endpoint allocated. On POSIX this removes the temporary directory;
   * on Windows there is nothing to remove (a pipe name is not a file) and this is a no-op.
   * Safe to call more than once, and safe to call when no peer ever listened.
   */
  dispose(): void;
}

export interface LocalIpcEndpointOptions {
  /** Short identifying label for the temporary directory or pipe name: `[A-Za-z0-9._-]+`. */
  readonly label: string;
  /**
   * Endpoint name. POSIX turns it into `<label-dir>/<name>.sock`; Windows turns it into the tail
   * of the pipe name. Defaults to `peer`.
   */
  readonly name?: string;
  /**
   * Platform to select for. Defaults to the host platform, which is what a running test needs;
   * a test of the SELECTION itself may state a platform explicitly.
   */
  readonly platform?: NodeJS.Platform;
}

const LABEL_PATTERN = /^[A-Za-z0-9._-]+$/;

function assertSafeComponent(value: string, what: string): string {
  if (!LABEL_PATTERN.test(value)) {
    // Fail closed rather than silently mangling a name: a mangled endpoint would let a test bind
    // somewhere it did not intend to.
    throw new Error(`${what} may contain only letters, digits, dot, underscore and hyphen: '${value}'`);
  }
  return value;
}

/** The endpoint class the production client accepts on `platform`. */
export function localIpcEndpointKindFor(platform: NodeJS.Platform = process.platform): LocalIpcEndpointKind {
  return platform === 'win32' ? 'windows-named-pipe' : 'unix-socket';
}

/**
 * Reserve a local IPC endpoint for the platform in use.
 *
 * POSIX: a fresh `mkdtempSync` directory in the temporary root, and `<dir>/<name>.sock` inside it.
 * Windows: `\\.\pipe\iips-<label>-<uuid>-<name>` — a per-call unique pipe name, no file, no
 * directory, and nothing for a teardown to delete.
 *
 * The returned endpoint is NOT listening. Start a peer on `path` to serve it, or leave it unbound
 * to exercise the client's connection-failure path.
 */
export function createLocalIpcEndpoint(options: LocalIpcEndpointOptions): LocalIpcEndpoint {
  const label = assertSafeComponent(options.label, 'the endpoint label');
  const name = assertSafeComponent(options.name ?? 'peer', 'the endpoint name');
  const platform = options.platform ?? process.platform;
  const unique = randomUUID();

  if (platform === 'win32') {
    const path = `${WINDOWS_PIPE_PREFIX}iips-${label}-${unique}-${name}`;
    if (path.length > MAX_WINDOWS_PIPE_PATH_LENGTH) {
      throw new Error(
        `the Windows pipe path is ${path.length} characters, over the ${MAX_WINDOWS_PIPE_PATH_LENGTH}-character limit`,
      );
    }
    return {
      kind: 'windows-named-pipe',
      path,
      directory: null,
      dispose: (): void => {
        // A pipe name is not a filesystem object: there is nothing to delete, and inventing a
        // deletion step would only risk touching something this endpoint never owned.
      },
    };
  }

  const directory = mkdtempSync(join(tmpdir(), `iips-${label}-`));
  const path = join(directory, `${name}.sock`);
  if (path.length > MAX_POSIX_SOCKET_PATH_LENGTH) {
    rmSync(directory, { recursive: true, force: true });
    throw new Error(
      `the socket path is ${path.length} characters, over the ${MAX_POSIX_SOCKET_PATH_LENGTH}-character POSIX limit`,
    );
  }
  let disposed = false;
  return {
    kind: 'unix-socket',
    path,
    directory,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
