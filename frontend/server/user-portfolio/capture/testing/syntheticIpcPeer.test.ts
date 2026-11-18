/**
 * TEST-FIXTURE tests — the synthetic contract-v1 peer, on the platform-aware endpoint.
 *
 * WHY THIS FILE EXISTS
 *   The peer is the fixture the capture CLI's end-to-end tests run against. On Windows it used to
 *   fail before any assertion: it was handed a POSIX `.sock` path and `listen` answered `EACCES`.
 *   The peer now takes a platform-selected local endpoint and applies the response-delivery policy
 *   that matches it — half-close with the frame on POSIX, write-and-stay-open on a Windows named
 *   pipe, because ending a pipe breaks it before the client has read the response.
 *
 *   These tests drive the peer through the REAL `callIpc` client, so framing, one-request-per-
 *   connection and zero-byte-close semantics are exercised rather than described. The Windows
 *   policy branch is exercised on every host by stating the endpoint kind explicitly; a real
 *   Windows runner then exercises it on a real pipe (see the Windows compatibility workflow).
 *
 * NOT EVIDENCE. Everything served here is fabricated and labelled synthetic by the utility. No
 * IPD, no database, no binding, no vendor and no Windows host are involved.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  callIpc,
  IPC_ENDPOINT_SETTING,
  resolveIpcEndpoint,
  type IpcEndpointTarget,
} from '../../ipcClient.js';
import {
  createLocalIpcEndpoint,
  localIpcEndpointKindFor,
  type LocalIpcEndpoint,
  type LocalIpcEndpointKind,
} from '../../testing/localIpcEndpoint.js';
import {
  startSyntheticPeer,
  SYNTHETIC_PORTFOLIO_ID,
  type SyntheticPeer,
  type SyntheticPeerMode,
} from './syntheticIpcPeer.js';

const reserved: LocalIpcEndpoint[] = [];
const started: SyntheticPeer[] = [];

function reserve(label: string, name = 'peer'): LocalIpcEndpoint {
  const endpoint = createLocalIpcEndpoint({ label, name });
  reserved.push(endpoint);
  return endpoint;
}

async function serve(
  endpoint: LocalIpcEndpoint,
  mode: SyntheticPeerMode = 'CONSISTENT',
  kind?: LocalIpcEndpointKind,
): Promise<SyntheticPeer> {
  const peer = kind === undefined
    ? await startSyntheticPeer(endpoint.path, mode)
    : await startSyntheticPeer(endpoint.path, mode, kind);
  started.push(peer);
  return peer;
}

/** The client resolves the SAME endpoint string the peer was handed — never a second derivation. */
function targetOf(endpoint: LocalIpcEndpoint): IpcEndpointTarget {
  return resolveIpcEndpoint({ [IPC_ENDPOINT_SETTING]: endpoint.path });
}

afterEach(async () => {
  for (const peer of started.splice(0)) await peer.close();
  for (const endpoint of reserved.splice(0)) endpoint.dispose();
});

describe('the synthetic peer over a platform-selected local endpoint', () => {
  it('serves the host platform endpoint class through the real client', async () => {
    const endpoint = reserve('syn-peer-host');
    const peer = await serve(endpoint);
    expect(peer.kind).toBe(localIpcEndpointKindFor());
    expect(peer.path).toBe(endpoint.path);

    const call = await callIpc('portfolio.list', undefined, { target: targetOf(endpoint) });

    expect(call.kind).toBe('SUCCESS');
    if (call.kind !== 'SUCCESS') return;
    expect(call.bytesReceived).toBeGreaterThan(0);
    const listed = call.frame.result as Array<{ portfolioId: string }>;
    expect(listed[0]?.portfolioId).toBe(SYNTHETIC_PORTFOLIO_ID);
    expect(peer.operations).toEqual(['portfolio.list']);
  });

  it('delivers a complete frame under the Windows named-pipe policy, on any host', async () => {
    const endpoint = reserve('syn-peer-win');
    // Stated explicitly, so the pipe policy is exercised wherever this suite runs: the response is
    // written and the connection is left open for the client to destroy.
    const peer = await serve(endpoint, 'CONSISTENT', 'windows-named-pipe');
    expect(peer.kind).toBe('windows-named-pipe');

    const first = await callIpc('portfolio.list', undefined, { target: targetOf(endpoint) });
    const second = await callIpc('portfolio.get', { portfolioId: SYNTHETIC_PORTFOLIO_ID }, {
      target: targetOf(endpoint),
    });

    expect(first.kind).toBe('SUCCESS');
    expect(second.kind).toBe('SUCCESS');
    if (second.kind !== 'SUCCESS') return;
    const detail = second.frame.result as { portfolioId: string; holdings: unknown[] };
    expect(detail.portfolioId).toBe(SYNTHETIC_PORTFOLIO_ID);
    expect(detail.holdings).toHaveLength(2);
    // The peer stayed serviceable: it did not tear its own connection down after the first frame.
    expect(peer.operations).toEqual(['portfolio.list', 'portfolio.get']);
  });

  it('answers the three reads and closes any other operation with zero bytes', async () => {
    const endpoint = reserve('syn-peer-ops');
    const peer = await serve(endpoint);
    const target = targetOf(endpoint);

    expect((await callIpc('portfolio.list', undefined, { target })).kind).toBe('SUCCESS');
    expect((await callIpc('portfolio.get', { portfolioId: SYNTHETIC_PORTFOLIO_ID }, { target })).kind).toBe('SUCCESS');
    expect((await callIpc('portfolio.revisions', { portfolioId: SYNTHETIC_PORTFOLIO_ID }, { target })).kind).toBe('SUCCESS');

    // A write reaches the fixture and is refused the way a pre-authorization refusal looks:
    // zero bytes and a close, with no reason disclosed.
    const refused = await callIpc('portfolio.create', {}, { target });
    expect(refused.kind).toBe('CLASS_P');
    if (refused.kind !== 'CLASS_P') return;
    expect(refused.bytesReceived).toBe(0);
    expect(refused.reason).toBeNull();
    expect(peer.operations).toEqual([
      'portfolio.list',
      'portfolio.get',
      'portfolio.revisions',
      'portfolio.create',
    ]);
  });

  it('reports every request as Class P in the zero-byte-close mode', async () => {
    const endpoint = reserve('syn-peer-classp');
    const peer = await serve(endpoint, 'CLASS_P');

    const call = await callIpc('portfolio.list', undefined, { target: targetOf(endpoint) });

    expect(call.kind).toBe('CLASS_P');
    expect(peer.operations).toEqual(['portfolio.list']);
  });

  it('reports a newer revision on the second get of the first attempt in the inconsistent mode', async () => {
    const endpoint = reserve('syn-peer-inconsistent');
    await serve(endpoint, 'FIRST_ATTEMPT_INCONSISTENT');
    const target = targetOf(endpoint);

    await callIpc('portfolio.list', undefined, { target });
    const firstGet = await callIpc('portfolio.get', { portfolioId: SYNTHETIC_PORTFOLIO_ID }, { target });
    const secondGet = await callIpc('portfolio.get', { portfolioId: SYNTHETIC_PORTFOLIO_ID }, { target });

    expect(firstGet.kind).toBe('SUCCESS');
    expect(secondGet.kind).toBe('SUCCESS');
    if (firstGet.kind !== 'SUCCESS' || secondGet.kind !== 'SUCCESS') return;
    expect((firstGet.frame.result as { revision: number }).revision).toBe(1);
    expect((secondGet.frame.result as { revision: number }).revision).toBe(2);
  });

  it('refuses to start a second peer on an endpoint that is already served, and says why', async () => {
    const endpoint = reserve('syn-peer-taken');
    const running = await serve(endpoint);

    // The failed start must be observable and must not be handed back as a peer: a caller that
    // received one would close something that never started.
    await expect(startSyntheticPeer(endpoint.path)).rejects.toThrow(
      new RegExp(`could not listen on the ${localIpcEndpointKindFor()} endpoint`),
    );

    // The already-running peer is untouched by the refused second start.
    const call = await callIpc('portfolio.list', undefined, { target: targetOf(endpoint) });
    expect(call.kind).toBe('SUCCESS');
    expect(running.operations).toEqual(['portfolio.list']);
  });

  it('closes a started peer once, releases the endpoint, and is idempotent', async () => {
    const endpoint = reserve('syn-peer-close');
    const peer = await serve(endpoint);
    const target = targetOf(endpoint);
    expect((await callIpc('portfolio.list', undefined, { target })).kind).toBe('SUCCESS');

    await peer.close();
    await peer.close();

    // Nothing is serving any more: the client reports a transport fault, not a hang.
    const after = await callIpc('portfolio.list', undefined, { target });
    expect(after.kind).toBe('OUTCOME_UNKNOWN');
  });
});
